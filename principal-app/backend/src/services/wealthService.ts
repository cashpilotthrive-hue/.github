import prisma from "../infra/db";
import { WealthSummary } from "../models";

/**
 * Return the latest wealth snapshot or a default zero summary.
 */
export async function getWealthSummary(): Promise<WealthSummary> {
  const snapshot = await prisma.wealthSnapshot.findFirst({
    orderBy: { recordedAt: "desc" },
  });

  if (!snapshot) {
    return {
      totalUsd: 0,
      breakdown: { cash: 0, investments: 0, crypto: 0, other: 0 },
      recordedAt: new Date(),
    };
  }

  const breakdown = JSON.parse(snapshot.breakdown) as WealthSummary["breakdown"];
  return {
    totalUsd: snapshot.totalUsd,
    breakdown,
    recordedAt: snapshot.recordedAt,
  };
}

/**
 * Record a new wealth snapshot.
 */
export async function recordWealthSnapshot(
  totalUsd: number,
  breakdown: WealthSummary["breakdown"]
): Promise<WealthSummary> {
  const snapshot = await prisma.wealthSnapshot.create({
    data: {
      totalUsd,
      breakdown: JSON.stringify(breakdown),
    },
  });
  return {
    totalUsd: snapshot.totalUsd,
    breakdown,
    recordedAt: snapshot.recordedAt,
  };
}
