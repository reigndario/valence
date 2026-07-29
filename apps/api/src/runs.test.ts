import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { sql } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerEngagementRoutes } from "./engagements.js";
import { db } from "./kysely.js";
import { buildQueue } from "./queue.js";
import { redis } from "./redis.js";
import { registerRunRoutes } from "./runs.js";

describe("run listing", () => {
  const app = Fastify();

  beforeAll(async () => {
    await registerEngagementRoutes(app);
    await registerRunRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await buildQueue.close();
    await db.destroy();
    redis.disconnect();
  });

  it("returns an empty list for an engagement with no runs, then the run once persisted", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/engagements",
      payload: {
        repoUrl: "https://github.com/foundry-rs/forge-template",
        commitSha: "f5db6aeeff588c8a789b6f7da83313950fd97178",
      },
    });
    const engagementId = createRes.json().id as string;

    const emptyRes = await app.inject({ method: "GET", url: `/engagements/${engagementId}/runs` });
    expect(emptyRes.statusCode).toBe(200);
    expect(emptyRes.json()).toEqual([]);

    const runId = randomUUID();
    await sql`
      insert into runs (id, engagement_id, status, solc_matrix, deterministic, artifact_volume, attempts)
      values (${runId}, ${engagementId}, 'ok', ARRAY['0.8.35'], true, 'valence-artifacts', '[]'::jsonb)
    `.execute(db);

    const res = await app.inject({ method: "GET", url: `/engagements/${engagementId}/runs` });
    expect(res.statusCode).toBe(200);
    const runs = res.json();
    expect(runs).toHaveLength(1);
    expect(runs[0].id).toBe(runId);
    expect(runs[0].status).toBe("ok");
    expect(runs[0].deterministic).toBe(true);
    expect(runs[0].solcMatrix).toEqual(["0.8.35"]);
  });
});
