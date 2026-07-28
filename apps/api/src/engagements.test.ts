import Fastify from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerEngagementRoutes } from "./engagements.js";
import { db } from "./kysely.js";
import { buildQueue } from "./queue.js";
import { redis } from "./redis.js";

describe("engagement intake", () => {
  const app = Fastify();

  beforeAll(async () => {
    await registerEngagementRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await buildQueue.close();
    await db.destroy(); // ends the underlying pg pool it was constructed with
    redis.disconnect();
  });

  it("rejects a request missing repoUrl/commitSha", async () => {
    const res = await app.inject({ method: "POST", url: "/engagements", payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it("creates an engagement, enqueues a build job, and can read it back", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/engagements",
      payload: {
        repoUrl: "https://github.com/foundry-rs/forge-template",
        commitSha: "f5db6aeeff588c8a789b6f7da83313950fd97178",
        scopeGlobs: ["src/**/*.sol"],
        docsLinks: ["https://example.com/spec"],
        deadline: "2026-08-15",
      },
    });

    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.id).toBeTypeOf("string");
    expect(created.repoUrl).toBe("https://github.com/foundry-rs/forge-template");
    expect(created.commitSha).toBe("f5db6aeeff588c8a789b6f7da83313950fd97178");
    expect(created.scopeGlobs).toEqual(["src/**/*.sol"]);
    expect(created.deadline).toBe("2026-08-15");

    const jobs = await buildQueue.getJobs(["waiting", "active"]);
    expect(jobs.some((job) => job.data.engagementId === created.id)).toBe(true);

    const getRes = await app.inject({ method: "GET", url: `/engagements/${created.id}` });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().id).toBe(created.id);
  });

  it("404s for an unknown engagement id", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/engagements/00000000-0000-0000-0000-000000000000",
    });
    expect(res.statusCode).toBe(404);
  });
});
