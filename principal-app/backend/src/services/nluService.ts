import { CommandObject } from "../models";
import { v4 as uuidv4 } from "uuid";

const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  commandType: CommandObject["commandType"];
}> = [
  { pattern: /\b(buy|purchase)\b/i, commandType: "buy" },
  { pattern: /\b(sell|liquidate)\b/i, commandType: "sell" },
  { pattern: /\b(withdraw|cash out)\b/i, commandType: "withdraw" },
  { pattern: /\b(deposit|add funds)\b/i, commandType: "deposit" },
];

/**
 * Minimal rule-based NLU: parse a free-text message into a CommandObject or null.
 */
export function parseCommand(message: string): CommandObject | null {
  for (const { pattern, commandType } of INTENT_PATTERNS) {
    if (pattern.test(message)) {
      const amountMatch = message.match(/(?<!\w)\$?([\d,]+(?:\.\d{1,2})?)(?!\w)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(/,/g, ""))
        : undefined;
      return {
        id: uuidv4(),
        commandType,
        payload: { rawMessage: message, ...(amount != null && { amount }) },
      };
    }
  }
  return null;
}

/**
 * Generate a human-readable reply for a given message.
 */
export function generateReply(
  message: string,
  command: CommandObject | null
): string {
  if (command) {
    return `Understood. I've queued a ${command.commandType} command (id: ${command.id}). Please confirm to proceed.`;
  }
  if (/\b(wealth|balance|worth|portfolio)\b/i.test(message)) {
    return "I'll fetch your current wealth summary right away.";
  }
  return "I'm here to help. You can ask about your balance, or say things like 'buy $500 of BTC'.";
}
