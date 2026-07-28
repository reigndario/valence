import Fastify from "fastify";
import { Redis } from "ioredis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildLogChannel, registerLogsRoute } from "./logs.js";
import { redis } from "./redis.js";

describe("GET /engagements/:id/logs (SSE)", () => {
  const app = Fastify();
  let baseUrl: string;

  beforeAll(async () => {
    await registerLogsRoute(app);
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (address === null || typeof address === "string") {
      throw new Error("expected a bound TCP address");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
    redis.disconnect();
  });

  it("streams a message published on the engagement's log channel", async () => {
    const engagementId = "11111111-1111-1111-1111-111111111111";
    const response = await fetch(`${baseUrl}/engagements/${engagementId}/logs`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("expected a readable response body");
    const decoder = new TextDecoder();

    async function readUntil(
      activeReader: ReadableStreamDefaultReader<Uint8Array>,
      predicate: (buffer: string) => boolean,
      timeoutMs: number,
    ): Promise<string> {
      let buffer = "";
      const deadline = Date.now() + timeoutMs;
      while (!predicate(buffer)) {
        if (Date.now() > deadline) throw new Error(`timed out waiting for SSE data; got: ${buffer}`);
        const { value, done } = await activeReader.read();
        if (done) throw new Error("stream closed before predicate matched");
        buffer += decoder.decode(value, { stream: true });
      }
      return buffer;
    }

    // The route writes a ": connected" comment right after it subscribes — wait for it so
    // the publish below isn't racing the subscription.
    await readUntil(reader, (buf) => buf.includes(": connected"), 5000);

    const publisher = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
    await publisher.publish(buildLogChannel(engagementId), JSON.stringify({ line: "hello from build", stream: "stdout" }));

    const buffer = await readUntil(reader, (buf) => buf.includes("hello from build"), 5000);
    expect(buffer).toContain('data: {"line":"hello from build","stream":"stdout"}');

    await publisher.quit();
    await reader.cancel();
  }, 15_000);
});
