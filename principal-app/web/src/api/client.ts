import axios from "axios";
import type { WealthSummary, ActivityItem, CreditEvent, ChatResponse } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "/api";

const http = axios.create({ baseURL: BASE_URL });

export const fetchWealth = (): Promise<WealthSummary> =>
  http.get<WealthSummary>("/wealth").then((r) => r.data);

export const fetchActivity = (limit = 20): Promise<ActivityItem[]> =>
  http.get<ActivityItem[]>(`/activity?limit=${limit}`).then((r) => r.data);

export const fetchCredits = (limit = 50): Promise<CreditEvent[]> =>
  http.get<CreditEvent[]>(`/credits?limit=${limit}`).then((r) => r.data);

export const sendChatMessage = (
  message: string,
  apiKey: string
): Promise<ChatResponse> =>
  http
    .post<ChatResponse>(
      "/chat",
      { message },
      { headers: { "x-api-key": apiKey } }
    )
    .then((r) => r.data);
