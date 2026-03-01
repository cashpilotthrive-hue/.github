import { EventEmitter } from "events";

const TIER_CONFIG = {
  dashboard: 10_000_000,
  push: 100_000_000,
  sticky: 1_000_000_000,
};

const WINDOW_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
};

export class CreditEngine {
  constructor({ ownerId = "Principal" } = {}) {
    this.ownerId = ownerId;
    this.events = [];
    this.emitter = new EventEmitter();
  }

  classifyNotification(amount) {
    if (amount >= TIER_CONFIG.sticky) return "sticky";
    if (amount >= TIER_CONFIG.push) return "push";
    if (amount >= TIER_CONFIG.dashboard) return "dashboard";
    return "none";
  }

  addEvent(input) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Credit amount must be a positive number.");
    }

    const event = {
      id: input.id ?? `cred_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      owner_id: input.owner_id ?? this.ownerId,
      amount: input.amount,
      currency: input.currency ?? "USD",
      source_type: input.source_type ?? "INTERNAL",
      source_ref: input.source_ref ?? null,
      description: input.description ?? "Credit event",
      timestamp: input.timestamp ?? new Date().toISOString(),
    };

    const tier = this.classifyNotification(event.amount);
    const enriched = { ...event, alert_tier: tier };

    this.events.unshift(enriched);
    this.events = this.events.slice(0, 10_000);
    this.emitter.emit("credit", enriched);

    return enriched;
  }

  getRecent(limit = 50) {
    return this.events.slice(0, limit);
  }

  getTotals(now = Date.now()) {
    const totals = { minute: 0, hour: 0, day: 0, overall: 0 };

    for (const evt of this.events) {
      const ts = new Date(evt.timestamp).getTime();
      if (Number.isNaN(ts)) continue;
      const age = now - ts;

      totals.overall += evt.amount;
      if (age <= WINDOW_MS.minute) totals.minute += evt.amount;
      if (age <= WINDOW_MS.hour) totals.hour += evt.amount;
      if (age <= WINDOW_MS.day) totals.day += evt.amount;
    }

    return totals;
  }
}

export const creditEngine = new CreditEngine();
