import type { FastifyInstance } from "fastify";
import { redis } from "./redis.js";

export function buildLogChannel(engagementId: string) {
  return `valence:logs:engagement:${engagementId}`;
}

export async function registerLogsRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>("/engagements/:id/logs", async (req, reply) => {
    const channel = buildLogChannel(req.params.id);
    const subscriber = redis.duplicate();

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    subscriber.on("message", (_channel, message) => {
      reply.raw.write(`data: ${message}\n\n`);
    });

    await subscriber.subscribe(channel);
    reply.raw.write(": connected\n\n");

    req.raw.on("close", () => {
      subscriber.unsubscribe(channel).catch(() => {});
      subscriber.quit().catch(() => {});
    });

    return reply;
  });
}
