export interface WealthSummary {
  totalUsd: number;
  breakdown: {
    cash: number;
    investments: number;
    crypto: number;
    other: number;
  };
  recordedAt: string;
}

export interface ActivityItem {
  id: string;
  commandType: string;
  payload: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface CreditEvent {
  id: string;
  eventType: "alert" | "payment" | "limit_change";
  description: string;
  amount?: number;
  occurredAt: string;
}

export interface ChatResponse {
  reply: string;
  command?: {
    id: string;
    commandType: string;
    payload: Record<string, unknown>;
  };
  executionRecord?: ActivityItem;
}
