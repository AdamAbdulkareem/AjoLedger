import type { GroupSummary } from "../models/group";
import type { GroupContributionStatusKey } from "../models/home";
import {
  readCycleContributionStatus,
  resolveGrossTransferBreakdown,
} from "./contributionPayment";
import {
  resolveContributionDueDate,
  resolveOutstandingContribution,
} from "./resolveOutstandingContribution";

export type { GroupContributionStatusKey };

export type GroupListCardViewModel = {
  contributionAmount: number;
  statusKey: GroupContributionStatusKey;
  position: number;
  potCollected: number;
  potTarget: number;
  currentCycle: number;
  /** Pay-by date for the current round (API due date or day before payout). */
  contributionDueDate: string;
  /** Beneficiary payout date from the API. */
  nextPayoutDate: string;
  /** Exact gross transfer still owed (0 when paid). */
  amountRemaining: number;
  progressPercent: number;
};

function computeProgress(collected: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round((collected / target) * 100), 0), 100);
}

function readPositiveNumber(value: number | null | undefined): number {
  if (value != null && Number.isFinite(value) && value > 0) {
    return value;
  }

  return 0;
}

export function mapContributionStatusKey(
  rawStatus?: string,
): GroupContributionStatusKey {
  const value = rawStatus?.trim().toUpperCase() ?? "";

  if (
    value === "PAID" ||
    value === "COMPLETE" ||
    value === "COMPLETED" ||
    value === "SUCCESS" ||
    value === "SUCCESSFUL" ||
    value === "CONFIRMED" ||
    value === "RECEIVED" ||
    value === "SETTLED"
  ) {
    return "paid";
  }

  return "notPaid";
}

export function readMyDetailsStatus(
  myDetails: GroupSummary["myDetails"],
): string | undefined {
  if (!myDetails) {
    return undefined;
  }

  const extended = myDetails as GroupSummary["myDetails"] & {
    paymentStatus?: string;
    contributionStatus?: string;
    weekStatus?: string;
  };

  return (
    extended.status?.trim() ||
    extended.paymentStatus?.trim() ||
    extended.contributionStatus?.trim() ||
    extended.weekStatus?.trim() ||
    undefined
  );
}

export function buildGroupListCardViewModel(
  group: GroupSummary,
  _index = 0,
): GroupListCardViewModel {
  const cycle = group.cycleDetails;
  const myDetails = group.myDetails;

  const contributionAmount = readPositiveNumber(
    cycle?.contributionAmount ?? group.contributionAmount,
  );
  const statusRaw = readCycleContributionStatus(cycle, myDetails);
  const statusKey = statusRaw
    ? mapContributionStatusKey(statusRaw)
    : "notPaid";
  const position = readPositiveNumber(myDetails?.position);
  const potCollected = readPositiveNumber(cycle?.potCollected);
  const potTarget = readPositiveNumber(cycle?.potTarget);
  const currentCycle = readPositiveNumber(cycle?.currentCycle);
  const nextPayoutDate = cycle?.nextPayoutDate?.trim() ?? "";
  const contributionDueDate = resolveContributionDueDate(
    cycle?.dueDate,
    nextPayoutDate || undefined,
  );
  const { grossTransfer } = resolveGrossTransferBreakdown(
    cycle,
    contributionAmount,
  );
  const amountRemaining = resolveOutstandingContribution({
    contributionAmount,
    statusKey,
    grossTransferAmount: grossTransfer,
  });

  return {
    contributionAmount,
    statusKey,
    position,
    potCollected,
    potTarget,
    currentCycle,
    contributionDueDate,
    nextPayoutDate,
    amountRemaining,
    progressPercent: computeProgress(potCollected, potTarget),
  };
}
