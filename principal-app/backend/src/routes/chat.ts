import { FastifyInstance } from "fastify";
import { parseCommand, generateReply } from "../services/nluService";
import { executeCommand } from "../services/commandService";
import { requirePrincipal } from "../infra/authz";

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/chat",
    { preHandler: [requirePrincipal] },
    async (request, reply) => {
      const { message } = request.body as { message: string };
      const command = parseCommand(message);
      const replyText = generateReply(message, command);

      let executionRecord;
      if (command) {
        executionRecord = await executeCommand(command);
      }

      return reply.send({
        reply: replyText,
        command: command ?? undefined,
        executionRecord: executionRecord ?? undefined,
      });
    }
  );
}
