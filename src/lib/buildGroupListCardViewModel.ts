import type { GroupSummary } from "../models/group";
import type { GroupContributionStatusKey } from "../models/home";

export type { GroupContributionStatusKey };

export type GroupListCardViewModel = {
  contributionAmount: number;
  statusKey: GroupContributionStatusKey;
  position: number;
  potCollected: number;
  potTarget: number;
  currentCycle: number;
  nextPayoutDate: string;
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

  if (value === "PAID" || value === "COMPLETE" || value === "COMPLETED") {
    return "paid";
  }

  if (
    value === "PARTIAL" ||
    value === "PARTIALLY_PAID" ||
    value === "IN_PROGRESS"
  ) {
    return "partial";
  }

  return "notPaid";
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
  const statusKey = myDetails?.status?.trim()
    ? mapContributionStatusKey(myDetails.status)
    : "notPaid";
  const position = readPositiveNumber(myDetails?.position);
  const potCollected = readPositiveNumber(cycle?.potCollected);
  const potTarget = readPositiveNumber(cycle?.potTarget);
  const currentCycle = readPositiveNumber(cycle?.currentCycle);
  const nextPayoutDate = cycle?.nextPayoutDate?.trim() ?? "";

  return {
    contributionAmount,
    statusKey,
    position,
    potCollected,
    potTarget,
    currentCycle,
    nextPayoutDate,
    progressPercent: computeProgress(potCollected, potTarget),
  };
}
