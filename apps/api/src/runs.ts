import type { FastifyInstance } from "fastify";
import { db } from "./kysely.js";
import type { RunAttemptJson } from "./db-types.js";

function toRunDTO(row: {
  id: string;
  engagement_id: string;
  status: string;
  reason: string | null;
  solc_matrix: string[];
  deterministic: boolean | null;
  artifact_volume: string;
  attempts: RunAttemptJson[];
  created_at: Date;
}) {
  return {
    id: row.id,
    engagementId: row.engagement_id,
    status: row.status,
    reason: row.reason,
    solcMatrix: row.solc_matrix,
    deterministic: row.deterministic,
    artifactVolume: row.artifact_volume,
    attempts: row.attempts,
    createdAt: row.created_at.toISOString(),
  };
}

export async function registerRunRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>("/engagements/:id/runs", async (req) => {
    const rows = await db
      .selectFrom("runs")
      .selectAll()
      .where("engagement_id", "=", req.params.id)
      .orderBy("created_at", "desc")
      .execute();

    return rows.map(toRunDTO);
  });
}
