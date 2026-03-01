import test from "node:test";
import assert from "node:assert/strict";
import { CreditEngine } from "../src/creditEngine.js";

test("classifies tiers correctly", () => {
  const engine = new CreditEngine();
  assert.equal(engine.classifyNotification(9_999_999), "none");
  assert.equal(engine.classifyNotification(10_000_000), "dashboard");
  assert.equal(engine.classifyNotification(100_000_000), "push");
  assert.equal(engine.classifyNotification(1_000_000_000), "sticky");
});

test("adds event and computes totals windows", () => {
  const now = Date.now();
  const engine = new CreditEngine();

  engine.addEvent({ amount: 10, timestamp: new Date(now - 10_000).toISOString() });
  engine.addEvent({ amount: 20, timestamp: new Date(now - 120_000).toISOString() });

  const totals = engine.getTotals(now);
  assert.equal(totals.minute, 10);
  assert.equal(totals.hour, 30);
  assert.equal(totals.day, 30);
  assert.equal(totals.overall, 30);
});
