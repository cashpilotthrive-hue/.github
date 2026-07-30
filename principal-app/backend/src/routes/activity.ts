import { FastifyInstance } from "fastify";
import { listActivity } from "../services/commandService";

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  app.get("/activity", async (request, reply) => {
    const limit = Number((request.query as { limit?: string }).limit ?? 20);
    const records = await listActivity(Math.min(limit, 100));
    return reply.send(records);
  });
}
