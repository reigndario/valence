import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { db } from "./kysely.js";
import { persistRunResult } from "./persist-run.js";
import type { PipelineResult } from "./sandbox/types.js";

describe("persistRunResult", () => {
  afterAll(async () => {
    await db.destroy();
  });

  it("writes a pipeline result to the runs table, keyed by the pipeline's own runId", async () => {
    const engagementId = randomUUID();
    await sql`
      insert into engagements (id, repo_url, commit_sha)
      values (${engagementId}, 'https://github.com/foundry-rs/forge-template', 'deadbeef')
    `.execute(db);

    const result: PipelineResult = {
      status: "ok",
      engagementId,
      runId: randomUUID(),
      repoUrl: "https://github.com/foundry-rs/forge-template",
      commitSha: "deadbeef",
      solcMatrix: ["0.8.35"],
      attempts: [
        { attempt: 1, exitCode: 0, timedOut: false, artifactPath: "a/1", outHash: "hash1" },
        { attempt: 2, exitCode: 0, timedOut: false, artifactPath: "a/2", outHash: "hash1" },
      ],
      deterministic: true,
      artifactVolume: "valence-artifacts",
    };

    await persistRunResult(result);

    const row = await db
      .selectFrom("runs")
      .selectAll()
      .where("id", "=", result.runId)
      .executeTakeFirstOrThrow();

    expect(row.engagement_id).toBe(engagementId);
    expect(row.status).toBe("ok");
    expect(row.deterministic).toBe(true);
    expect(row.solc_matrix).toEqual(["0.8.35"]);
    expect(row.attempts).toHaveLength(2);
    expect(row.attempts[0].outHash).toBe("hash1");
  });
});
