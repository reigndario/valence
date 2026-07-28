import { buildWorker } from "./worker.js";

console.log(`orchestrator worker listening on queue "${buildWorker.name}"`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void buildWorker.close().then(() => process.exit(0));
  });
}
