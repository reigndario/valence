import { spawn } from "node:child_process";
import { chmod, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { LogSink } from "./types.js";

function runRaw(cmd: string, args: string[], cwd: string, onLog?: LogSink): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd });
    child.stdout.on("data", (chunk: Buffer) => onLog?.(chunk.toString("utf8").trimEnd(), "stdout"));
    child.stderr.on("data", (chunk: Buffer) => onLog?.(chunk.toString("utf8").trimEnd(), "stderr"));
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
}

async function run(cmd: string, args: string[], cwd: string, onLog?: LogSink): Promise<void> {
  const code = await runRaw(cmd, args, cwd, onLog);
  if (code !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited with code ${code}`);
  }
}

export interface ClonedWorkspace {
  hostDir: string;
  cleanup(): Promise<void>;
}

// Clones the pinned commit into a fresh, single-use temp directory — never reused across
// engagements or runs, deleted once the run finishes. This is the dependency-fetch step
// (needs network) and runs as a plain host process rather than inside the hardened build
// sandbox: the security boundary this phase is built around is *executing* the repo's build
// tooling (forge/solc, and anything a build script does), not fetching known source over
// HTTPS at a pinned commit. Git hooks are disabled defensively regardless.
export async function cloneAtPinnedCommit(
  repoUrl: string,
  commitSha: string,
  onLog?: LogSink,
): Promise<ClonedWorkspace> {
  const hostDir = await mkdtemp(path.join(os.tmpdir(), "valence-run-"));

  try {
    await run("git", ["clone", "--quiet", repoUrl, hostDir], os.tmpdir(), onLog);
    await run("git", ["config", "core.hooksPath", "/dev/null"], hostDir, onLog);

    // The default clone already has every commit reachable from the default branch, which
    // covers the common case cheaply. Only fall back to an explicit fetch-by-sha (which not
    // every remote allows for arbitrary commits) if the pinned commit isn't already local.
    const directCheckout = await runRaw("git", ["checkout", "--quiet", commitSha], hostDir, onLog);
    if (directCheckout !== 0) {
      await run("git", ["fetch", "--quiet", "origin", commitSha], hostDir, onLog);
      await run("git", ["checkout", "--quiet", commitSha], hostDir, onLog);
    }

    await run("git", ["submodule", "update", "--init", "--recursive", "--quiet"], hostDir, onLog);
    // The build container runs as a fixed non-root uid (1000) that doesn't own this host
    // directory; it needs to write cache/out into it during the network-on fetch phase.
    await chmod(hostDir, 0o777);
  } catch (err) {
    await rm(hostDir, { recursive: true, force: true });
    throw err;
  }

  return {
    hostDir,
    async cleanup() {
      await rm(hostDir, { recursive: true, force: true });
    },
  };
}
