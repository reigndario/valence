import { db } from "./kysely.js";
import type { PipelineResult } from "./sandbox/types.js";

// Phase 1's pipeline computes a result but has nowhere durable to put it — this is that
// durable landing spot, so apps/api can list runs and the Phase 2 report page has something
// to render. Only called from the real BullMQ consumer path (worker.ts); demo.ts's manual
// run against engagementId "demo" deliberately skips this since there's no matching
// engagement row for the foreign key.
export async function persistRunResult(result: PipelineResult): Promise<void> {
  await db
    .insertInto("runs")
    .values({
      id: result.runId,
      engagement_id: result.engagementId,
      status: result.status,
      reason: result.reason ?? null,
      solc_matrix: result.solcMatrix,
      deterministic: result.deterministic,
      artifact_volume: result.artifactVolume,
      attempts: JSON.stringify(
        result.attempts.map((a) => ({
          attempt: a.attempt,
          exitCode: a.exitCode,
          timedOut: a.timedOut,
          artifactPath: a.artifactPath,
          outHash: a.outHash,
        })),
      ),
    })
    .execute();
}
