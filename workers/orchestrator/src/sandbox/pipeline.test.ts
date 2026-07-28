import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { runDockerCommand } from "./docker.js";
import { runBuildPipeline } from "./pipeline.js";

async function countArtifactFiles(volume: string, artifactPath: string): Promise<number> {
  const { stdout } = await runDockerCommand([
    "run",
    "--rm",
    "-v",
    `${volume}:/artifact-out`,
    "--entrypoint",
    "sh",
    "ghcr.io/foundry-rs/foundry:latest",
    "-c",
    `find /artifact-out/${artifactPath}/out -type f | wc -l`,
  ]);
  return Number(stdout.trim());
}

// Phase 1's acceptance test: point the real pipeline at a real public Foundry repo and
// confirm a reproducible (deterministic) build plus a stored artifact set. Requires Docker
// and network egress (to clone the repo and pull/warm the Foundry image's solc cache), so it
// is slower than a unit test — that's inherent to exercising the actual sandbox, not a stub.
describe("build pipeline (real public Foundry repo)", () => {
  it(
    "clones, builds twice, confirms determinism, and persists artifacts",
    async () => {
      const logs: string[] = [];
      const result = await runBuildPipeline({
        engagementId: randomUUID(),
        repoUrl: "https://github.com/foundry-rs/forge-template",
        commitSha: "f5db6aeeff588c8a789b6f7da83313950fd97178",
        onLog: (line) => logs.push(line),
      });

      expect(result.status).toBe("ok");
      expect(result.reason).toBeUndefined();
      expect(result.solcMatrix).toEqual(["0.8.35"]);
      expect(result.attempts).toHaveLength(2);

      for (const attempt of result.attempts) {
        expect(attempt.exitCode).toBe(0);
        expect(attempt.timedOut).toBe(false);
        expect(attempt.outHash).toBeTypeOf("string");

        const fileCount = await countArtifactFiles(result.artifactVolume, attempt.artifactPath);
        expect(fileCount).toBeGreaterThan(0);
      }

      expect(result.deterministic).toBe(true);
      expect(result.attempts[0].outHash).toBe(result.attempts[1].outHash);
      expect(logs.length).toBeGreaterThan(0);
    },
    10 * 60 * 1000,
  );

  it("returns NOT_IMPLEMENTED for a repo with no foundry.toml at the pinned commit", async () => {
    const result = await runBuildPipeline({
      engagementId: randomUUID(),
      repoUrl: "https://github.com/octocat/Hello-World",
      commitSha: "7fd1a60b01f91b314f59955a4e4d4e80d8edf11",
    });

    expect(result.status).toBe("not_implemented");
    expect(result.reason).toContain("foundry.toml");
  }, 60 * 1000);
});
