import type { GroupContributionStatusKey } from "../models/home";

type ResolveOutstandingContributionInput = {
  /** Net contribution for the round (naira). */
  contributionAmount: number;
  statusKey: GroupContributionStatusKey;
  /** Exact gross inbound amount the user must transfer (naira). */
  grossTransferAmount?: number;
};

/** Outstanding transfer amount for the current cycle (naira). Full gross only — no partials. */
export function resolveOutstandingContribution({
  contributionAmount,
  statusKey,
  grossTransferAmount,
}: ResolveOutstandingContributionInput): number {
  if (statusKey === "paid") {
    return 0;
  }

  if (
    grossTransferAmount != null &&
    Number.isFinite(grossTransferAmount) &&
    grossTransferAmount > 0
  ) {
    return grossTransferAmount;
  }

  return contributionAmount > 0 ? contributionAmount : 0;
}

/** Subtract one calendar day in UTC; returns ISO string. */
export function dayBeforeIso(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString();
}

/**
 * Pay-by date for the current contribution round.
 * Prefers API `dueDate` / `contributionDueDate`; otherwise day before `nextPayoutDate`.
 */
export function resolveContributionDueDate(
  dueDate?: string | null,
  nextPayoutDate?: string | null,
): string {
  const resolvedDue = dueDate?.trim();
  if (resolvedDue) {
    return resolvedDue;
  }

  const payout = nextPayoutDate?.trim();
  if (!payout) {
    return "";
  }

  return dayBeforeIso(payout);
}
