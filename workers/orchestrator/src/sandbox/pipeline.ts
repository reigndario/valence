import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { artifactPathFor } from "./artifact-path.js";
import { cloneAtPinnedCommit } from "./clone.js";
import { runHardenedContainer } from "./docker.js";
import { resolveSolcMatrix } from "./solc-matrix.js";
import { ensureWritableVolume } from "./volumes.js";
import type { BuildAttempt, LogSink, PipelineInput, PipelineResult } from "./types.js";

const OUT_HASH_MARKER = "VALENCE_OUT_HASH=";

function emptyResult(
  status: PipelineResult["status"],
  reason: string,
  input: PipelineInput,
  runId: string,
): PipelineResult {
  return {
    status,
    reason,
    engagementId: input.engagementId,
    runId,
    repoUrl: input.repoUrl,
    commitSha: input.commitSha,
    solcMatrix: [],
    attempts: [],
    deterministic: null,
    artifactVolume: config.artifactVolume,
  };
}

// The Phase 1 acceptance pipeline: pinned-commit clone, solc matrix resolution, two
// independent hardened builds for a determinism check, and artifact persistence. Every
// hardened container runs read-only rootfs, dropped capabilities, no-new-privileges, an
// explicit seccomp profile, memory/CPU caps, and a hard wall-clock kill (see docker.ts).
// Only the dependency-fetch container gets network; both build containers run with
// --network none against the solc cache warmed by the fetch step.
export async function runBuildPipeline(input: PipelineInput): Promise<PipelineResult> {
  const runId = randomUUID();
  const { engagementId, repoUrl, commitSha, onLog } = input;

  const workspace = await cloneAtPinnedCommit(repoUrl, commitSha, onLog);

  try {
    const foundryTomlPath = path.join(workspace.hostDir, "foundry.toml");
    if (!existsSync(foundryTomlPath)) {
      return emptyResult(
        "not_implemented",
        "repo has no foundry.toml at the pinned commit — only Foundry repos are supported in Phase 1",
        input,
        runId,
      );
    }

    await ensureWritableVolume(config.svmCacheVolume);
    await ensureWritableVolume(config.artifactVolume);

    const fetchResult = await runHardenedContainer({
      name: `valence-fetch-${runId}`,
      image: config.foundryImage,
      entrypoint: "forge",
      args: ["build"],
      network: "bridge",
      user: "foundry",
      workdir: "/workspace-src",
      mounts: [
        { source: workspace.hostDir, target: "/workspace-src", mode: "rw" },
        { source: config.svmCacheVolume, target: "/home/foundry/.svm", mode: "rw" },
      ],
      tmpfs: [{ target: "/tmp", sizeMb: 256 }],
      memory: config.buildMemory,
      cpus: config.buildCpus,
      timeoutMs: config.buildTimeoutMs,
      seccompProfilePath: config.seccompProfilePath,
      onLog,
    });

    if (fetchResult.exitCode !== 0) {
      return emptyResult(
        "build_failed",
        `dependency-fetch build failed (exit ${String(fetchResult.exitCode)}${fetchResult.timedOut ? ", timed out" : ""})`,
        input,
        runId,
      );
    }

    const solcMatrix = await resolveSolcMatrix(workspace.hostDir);

    const attempts: BuildAttempt[] = [];
    for (const attemptNumber of [1, 2]) {
      const artifactPath = artifactPathFor(engagementId, runId, attemptNumber);

      let outHash: string | null = null;
      const captureHash: LogSink = (line, stream) => {
        if (stream === "stdout" && line.startsWith(OUT_HASH_MARKER)) {
          outHash = line.slice(OUT_HASH_MARKER.length).trim();
        }
        onLog?.(line, stream);
      };

      // Compute the artifact hash *inside* the container (a real Linux filesystem, case
      // sensitive) rather than copying build output back to the host to hash it there —
      // the orchestrator's own host filesystem may not be case sensitive (macOS/Docker
      // Desktop local dev), and Solidity build output legitimately contains sibling paths
      // like out/Test.sol and out/test.sol.
      const script = [
        "cp -r /workspace-src/. /workspace/",
        "cd /workspace",
        "forge build",
        `OUT_HASH=$(sha256sum $(find out -type f | sort) | sha256sum | awk '{print $1}')`,
        `mkdir -p /artifact-out/${artifactPath}/out`,
        `cp -r out/. /artifact-out/${artifactPath}/out/`,
        `echo "${OUT_HASH_MARKER}$OUT_HASH"`,
      ].join(" && ");

      const buildResult = await runHardenedContainer({
        name: `valence-build-${runId}-${attemptNumber}`,
        image: config.foundryImage,
        entrypoint: "sh",
        args: ["-c", script],
        network: "none",
        user: "foundry",
        mounts: [
          { source: workspace.hostDir, target: "/workspace-src", mode: "ro" },
          { source: config.svmCacheVolume, target: "/home/foundry/.svm", mode: "ro" },
          { source: config.artifactVolume, target: "/artifact-out", mode: "rw" },
        ],
        tmpfs: [{ target: "/workspace", sizeMb: 512 }],
        memory: config.buildMemory,
        cpus: config.buildCpus,
        timeoutMs: config.buildTimeoutMs,
        seccompProfilePath: config.seccompProfilePath,
        onLog: captureHash,
      });

      attempts.push({
        attempt: attemptNumber,
        exitCode: buildResult.exitCode,
        timedOut: buildResult.timedOut,
        artifactPath,
        outHash: buildResult.exitCode === 0 ? outHash : null,
      });
    }

    const allSucceeded = attempts.every((a) => a.outHash !== null);
    const deterministic = allSucceeded ? attempts[0].outHash === attempts[1].outHash : null;

    return {
      status: allSucceeded ? "ok" : "build_failed",
      reason: allSucceeded ? undefined : "one or more build attempts failed — see attempts[]",
      engagementId,
      runId,
      repoUrl,
      commitSha,
      solcMatrix,
      attempts,
      deterministic,
      artifactVolume: config.artifactVolume,
    };
  } finally {
    await workspace.cleanup();
  }
}
