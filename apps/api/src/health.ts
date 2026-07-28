import type { FastifyInstance } from "fastify";
import { pool } from "./db.js";
import { redis } from "./redis.js";

type CheckStatus = "ok" | "error";

export async function registerHealthRoute(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    const checks: Record<"postgres" | "redis", CheckStatus> = {
      postgres: "error",
      redis: "error",
    };

    try {
      await pool.query("select 1");
      checks.postgres = "ok";
    } catch (err) {
      app.log.warn({ err }, "postgres health check failed");
    }

    try {
      checks.redis = (await redis.ping()) === "PONG" ? "ok" : "error";
    } catch (err) {
      app.log.warn({ err }, "redis health check failed");
    }

    const healthy = Object.values(checks).every((status) => status === "ok");
    reply.code(healthy ? 200 : 503);
    return { status: healthy ? "ok" : "degraded", checks };
  });
}
