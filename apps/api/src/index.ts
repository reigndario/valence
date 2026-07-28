import Fastify from "fastify";
import { registerEngagementRoutes } from "./engagements.js";
import { registerHealthRoute } from "./health.js";
import { registerLogsRoute } from "./logs.js";

const app = Fastify({ logger: true });

await registerHealthRoute(app);
await registerEngagementRoutes(app);
await registerLogsRoute(app);

const port = Number(process.env.PORT ?? 8080);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
