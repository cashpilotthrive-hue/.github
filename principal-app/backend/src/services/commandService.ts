import prisma from "../infra/db";
import { CommandObject, ExecutionRecord } from "../models";

/**
 * Persist and execute a command.
 */
export async function executeCommand(
  command: CommandObject
): Promise<ExecutionRecord> {
  const record = await prisma.executionRecord.create({
    data: {
      id: command.id,
      commandType: command.commandType,
      payload: JSON.stringify(command.payload),
      status: "pending",
    },
  });

  // Simulate async execution – in production this would call external APIs.
  const updated = await prisma.executionRecord.update({
    where: { id: record.id },
    data: { status: "success" },
  });

  return updated as ExecutionRecord;
}

/**
 * List recent execution records.
 */
export async function listActivity(limit = 20): Promise<ExecutionRecord[]> {
  const records = await prisma.executionRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return records as ExecutionRecord[];
}
