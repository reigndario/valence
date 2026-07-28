import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
// src/config.ts (dev, via tsx) and dist/config.js (built) sit at the same depth
// under workers/orchestrator, so the walk-up to the repo root is identical either way.
const repoRoot = path.resolve(moduleDir, "../../..");

function resolveSeccompProfile(): string {
  const configured = process.env.VALENCE_SECCOMP_PROFILE;
  const resolved = configured
    ? path.resolve(configured)
    : path.join(repoRoot, "infra/docker/build-runner/seccomp-default.json");

  if (!existsSync(resolved)) {
    throw new Error(
      `sandbox seccomp profile not found at ${resolved} — refusing to run build containers without it`,
    );
  }

  return resolved;
}

export const config = {
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  foundryImage: process.env.VALENCE_FOUNDRY_IMAGE ?? "ghcr.io/foundry-rs/foundry:latest",
  // A Docker named volume, not a host bind-mount: it's the local-dev stand-in for the
  // Railway Volume attached to workers/orchestrator in production, and — unlike a path on
  // the orchestrator's own (often case-insensitive, on macOS) host filesystem — it's backed
  // by a real case-sensitive Linux filesystem, which matters because Solidity build output
  // legitimately contains sibling paths like out/Test.sol and out/test.sol.
  artifactVolume: process.env.VALENCE_ARTIFACT_VOLUME ?? "valence-artifacts",
  svmCacheVolume: process.env.VALENCE_SVM_CACHE_VOLUME ?? "valence-svm-cache",
  seccompProfilePath: resolveSeccompProfile(),
  buildTimeoutMs: Number(process.env.VALENCE_BUILD_TIMEOUT_MS ?? 5 * 60 * 1000),
  buildMemory: process.env.VALENCE_BUILD_MEMORY ?? "2g",
  buildCpus: process.env.VALENCE_BUILD_CPUS ?? "2",
};
