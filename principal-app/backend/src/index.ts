import Fastify from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import { chatRoutes } from "./routes/chat";
import { wealthRoutes } from "./routes/wealth";
import { activityRoutes } from "./routes/activity";
import { creditRoutes } from "./routes/credits";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(fastifyWebSocket);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  // Domain routes
  await app.register(chatRoutes);
  await app.register(wealthRoutes);
  await app.register(activityRoutes);
  await app.register(creditRoutes);

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
