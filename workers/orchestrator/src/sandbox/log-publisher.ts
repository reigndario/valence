import { publisher } from "../redis.js";
import type { LogSink } from "./types.js";

export function buildLogChannel(engagementId: string): string {
  return `valence:logs:engagement:${engagementId}`;
}

export function makeRedisLogSink(engagementId: string): LogSink {
  const channel = buildLogChannel(engagementId);
  return (line, stream) => {
    void publisher.publish(channel, JSON.stringify({ line, stream, ts: Date.now() }));
  };
}
