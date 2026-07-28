import { Redis } from "ioredis";
import { config } from "./config.js";

// BullMQ requires maxRetriesPerRequest: null on connections it owns (blocking commands).
export const queueConnection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

// Plain client for publishing log lines — separate from the BullMQ connection.
export const publisher = new Redis(config.redisUrl);
