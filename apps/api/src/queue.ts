import { Redis } from "ioredis";
import { Queue } from "bullmq";

export const BUILD_QUEUE_NAME = "builds";

export interface BuildJobData {
  engagementId: string;
  repoUrl: string;
  commitSha: string;
}

// BullMQ requires its own connection (blocking commands need maxRetriesPerRequest: null),
// separate from the plain ioredis client apps/api uses for health checks.
const queueConnection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const buildQueue = new Queue<BuildJobData>(BUILD_QUEUE_NAME, {
  connection: queueConnection,
});
