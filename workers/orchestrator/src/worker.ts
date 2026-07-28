import { Worker } from "bullmq";
import { BUILD_QUEUE_NAME, type BuildJobData } from "./queue.js";
import { queueConnection } from "./redis.js";
import { makeRedisLogSink } from "./sandbox/log-publisher.js";
import { runBuildPipeline } from "./sandbox/pipeline.js";

export const buildWorker = new Worker<BuildJobData>(
  BUILD_QUEUE_NAME,
  async (job) => {
    const onLog = makeRedisLogSink(job.data.engagementId);
    return runBuildPipeline({ ...job.data, onLog });
  },
  { connection: queueConnection },
);

buildWorker.on("failed", (job, err) => {
  console.error(`build job ${job?.id ?? "unknown"} failed`, err);
});
