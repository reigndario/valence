import { runBuildPipeline } from "./sandbox/pipeline.js";

// The runnable proof of Phase 1's acceptance test: point the sandbox pipeline at a real
// public Foundry repo and confirm a reproducible build plus a stored artifact set — outside
// of vitest, for `make demo`.
const DEMO_REPO_URL = "https://github.com/foundry-rs/forge-template";
const DEMO_COMMIT_SHA = "f5db6aeeff588c8a789b6f7da83313950fd97178";

console.log(`cloning ${DEMO_REPO_URL} at ${DEMO_COMMIT_SHA} and running the hardened build sandbox...`);

const result = await runBuildPipeline({
  engagementId: "demo",
  repoUrl: DEMO_REPO_URL,
  commitSha: DEMO_COMMIT_SHA,
  onLog: (line, stream) => {
    process[stream === "stderr" ? "stderr" : "stdout"].write(`  [${stream}] ${line}\n`);
  },
});

console.log(JSON.stringify(result, null, 2));

if (result.status !== "ok" || result.deterministic !== true) {
  console.error("FAIL: sandboxed build was not ok and deterministic");
  process.exit(1);
}

console.log(
  `PASS: reproducible build, artifacts persisted to Docker volume "${result.artifactVolume}"`,
);
