import { FastifyInstance } from "fastify";
import {
  getWealthSummary,
  recordWealthSnapshot,
} from "../services/wealthService";
import { requirePrincipal } from "../infra/authz";

export async function wealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/wealth", async (_request, reply) => {
    const summary = await getWealthSummary();
    return reply.send(summary);
  });

  app.post(
    "/wealth",
    { preHandler: [requirePrincipal] },
    async (request, reply) => {
      const { totalUsd, breakdown } = request.body as {
        totalUsd: number;
        breakdown: {
          cash: number;
          investments: number;
          crypto: number;
          other: number;
        };
      };
      const snapshot = await recordWealthSnapshot(totalUsd, breakdown);
      return reply.code(201).send(snapshot);
    }
  );
}
