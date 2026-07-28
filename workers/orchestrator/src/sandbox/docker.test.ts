import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runHardenedContainer } from "./docker.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const seccompProfilePath = path.join(repoRoot, "infra/docker/build-runner/seccomp-default.json");

describe("runHardenedContainer", () => {
  it("kills a container that exceeds its wall-clock timeout", async () => {
    expect(existsSync(seccompProfilePath)).toBe(true);

    const started = Date.now();
    const result = await runHardenedContainer({
      name: `valence-docker-test-timeout-${Date.now()}`,
      image: "ghcr.io/foundry-rs/foundry:latest",
      entrypoint: "sleep",
      args: ["60"],
      network: "none",
      user: "foundry",
      mounts: [],
      memory: "256m",
      cpus: "0.5",
      timeoutMs: 2000,
      seccompProfilePath,
    });
    const elapsedMs = Date.now() - started;

    expect(result.timedOut).toBe(true);
    // The container should be killed well before its own 60s sleep would finish.
    expect(elapsedMs).toBeLessThan(30_000);
  }, 40_000);

  it("does not report a timeout for a container that finishes on its own", async () => {
    const result = await runHardenedContainer({
      name: `valence-docker-test-ok-${Date.now()}`,
      image: "ghcr.io/foundry-rs/foundry:latest",
      entrypoint: "true",
      args: [],
      network: "none",
      user: "foundry",
      mounts: [],
      memory: "256m",
      cpus: "0.5",
      timeoutMs: 30_000,
      seccompProfilePath,
    });

    expect(result.exitCode).toBe(0);
    expect(result.timedOut).toBe(false);
  }, 40_000);
});
