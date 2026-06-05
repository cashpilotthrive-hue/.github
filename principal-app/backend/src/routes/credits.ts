import { FastifyInstance } from "fastify";
import {
  listCreditEvents,
  createCreditEvent,
} from "../services/creditService";
import { requirePrincipal } from "../infra/authz";

export async function creditRoutes(app: FastifyInstance): Promise<void> {
  // REST: list credit events
  app.get("/credits", async (request, reply) => {
    const limit = Number((request.query as { limit?: string }).limit ?? 50);
    const events = await listCreditEvents(Math.min(limit, 200));
    return reply.send(events);
  });

  // REST: create a credit event
  app.post(
    "/credits",
    { preHandler: [requirePrincipal] },
    async (request, reply) => {
      const { eventType, description, amount } = request.body as {
        eventType: "alert" | "payment" | "limit_change";
        description: string;
        amount?: number;
      };
      const event = await createCreditEvent(eventType, description, amount);
      return reply.code(201).send(event);
    }
  );

  // WebSocket: stream credit alerts in real time
  app.get(
    "/credits/ws",
    { websocket: true },
    (socket) => {
      socket.send(
        JSON.stringify({ type: "connected", message: "Credit alert stream ready" })
      );

      const interval = setInterval(async () => {
        const events = await listCreditEvents(5);
        socket.send(JSON.stringify({ type: "tick", events }));
      }, 10_000);

      socket.on("close", () => clearInterval(interval));
    }
  );
}
