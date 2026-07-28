import Fastify from "fastify";
import { registerHealthRoute } from "./health.js";

const app = Fastify({ logger: true });

await registerHealthRoute(app);

const port = Number(process.env.PORT ?? 8080);

app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
