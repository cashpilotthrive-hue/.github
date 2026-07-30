import { FastifyRequest, FastifyReply } from "fastify";

const PRINCIPAL_API_KEY = process.env.PRINCIPAL_API_KEY ?? "";

/**
 * Fastify preHandler hook that ensures only the authenticated Principal
 * can execute money-movement commands.
 */
export async function requirePrincipal(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers["x-api-key"];
  if (!PRINCIPAL_API_KEY || apiKey !== PRINCIPAL_API_KEY) {
    await reply.code(401).send({ error: "Unauthorized" });
    return;
  }
}
