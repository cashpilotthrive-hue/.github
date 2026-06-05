import prisma from "../infra/db";
import { CreditEvent } from "../models";

/**
 * List recent credit events.
 */
export async function listCreditEvents(limit = 50): Promise<CreditEvent[]> {
  const events = await prisma.creditEvent.findMany({
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return events as unknown as CreditEvent[];
}

/**
 * Create a new credit event (alert, payment, etc.).
 */
export async function createCreditEvent(
  eventType: CreditEvent["eventType"],
  description: string,
  amount?: number
): Promise<CreditEvent> {
  const event = await prisma.creditEvent.create({
    data: {
      eventType,
      description,
      ...(amount != null && { amount }),
    },
  });
  return event as unknown as CreditEvent;
}
