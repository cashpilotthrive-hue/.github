// Core domain types shared across the application

export interface CommandObject {
  id: string;
  commandType: "buy" | "sell" | "withdraw" | "deposit" | "query";
  payload: Record<string, unknown>;
}

export interface ExecutionRecord {
  id: string;
  commandType: string;
  payload: string;
  status: "pending" | "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface WealthSummary {
  totalUsd: number;
  breakdown: {
    cash: number;
    investments: number;
    crypto: number;
    other: number;
  };
  recordedAt: Date;
}

export interface CreditEvent {
  id: string;
  eventType: "alert" | "payment" | "limit_change";
  description: string;
  amount?: number;
  occurredAt: Date;
}

export interface ChatResponse {
  reply: string;
  command?: CommandObject;
}
