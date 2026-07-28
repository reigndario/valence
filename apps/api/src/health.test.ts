import Fastify from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pool } from "./db.js";
import { registerHealthRoute } from "./health.js";
import { redis } from "./redis.js";

describe("GET /health", () => {
  const app = Fastify();

  beforeAll(async () => {
    await registerHealthRoute(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
    redis.disconnect();
  });

  it("reports ok when postgres and redis are actually reachable", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      status: "ok",
      checks: { postgres: "ok", redis: "ok" },
    });
  });
});
