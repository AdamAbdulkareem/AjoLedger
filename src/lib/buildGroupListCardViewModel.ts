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

type MockEnrichment = Omit<GroupListCardViewModel, "progressPercent">;

const MOCK_ENRICHMENTS: MockEnrichment[] = [
  {
    contributionAmount: 50_000,
    statusKey: "partial",
    position: 5,
    potCollected: 350_000,
    potTarget: 500_000,
    currentCycle: 1,
    nextPayoutDate: "2026-07-09",
  },
  {
    contributionAmount: 2_500,
    statusKey: "paid",
    position: 10,
    potCollected: 25_000,
    potTarget: 25_000,
    currentCycle: 2,
    nextPayoutDate: "2026-07-09",
  },
  {
    contributionAmount: 15_000,
    statusKey: "notPaid",
    position: 3,
    potCollected: 0,
    potTarget: 150_000,
    currentCycle: 3,
    nextPayoutDate: "2026-07-09",
  },
];

function computeProgress(collected: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round((collected / target) * 100), 0), 100);
}

function isPositiveNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value) && value > 0;
}

function pickPositiveNumber(
  value: number | null | undefined,
  fallback: number,
): number {
  return isPositiveNumber(value) ? value : fallback;
}

function pickNonEmptyDate(value: string | undefined, fallback: string): string {
  if (!value?.trim()) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return value;
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

function pickMockEnrichment(index: number): MockEnrichment {
  return MOCK_ENRICHMENTS[index % MOCK_ENRICHMENTS.length];
}

function hasMeaningfulCycleDetails(
  cycle: GroupSummary["cycleDetails"],
): boolean {
  if (!cycle) {
    return false;
  }

  return (
    isPositiveNumber(cycle.contributionAmount) ||
    isPositiveNumber(cycle.potCollected) ||
    isPositiveNumber(cycle.potTarget) ||
    isPositiveNumber(cycle.currentCycle) ||
    Boolean(cycle.nextPayoutDate?.trim())
  );
}

export function buildGroupListCardViewModel(
  group: GroupSummary,
  index: number,
): GroupListCardViewModel {
  const mock = pickMockEnrichment(index);
  const cycle = group.cycleDetails;
  const myDetails = group.myDetails;
  const cycleIsPopulated = hasMeaningfulCycleDetails(cycle);

  const contributionAmount = pickPositiveNumber(
    cycle?.contributionAmount ?? group.contributionAmount,
    mock.contributionAmount,
  );

  const statusKey =
    cycleIsPopulated && myDetails?.status?.trim()
      ? mapContributionStatusKey(myDetails.status)
      : mock.statusKey;

  const position = pickPositiveNumber(myDetails?.position, mock.position);
  const potCollected = cycleIsPopulated
    ? pickPositiveNumber(cycle?.potCollected, mock.potCollected)
    : mock.potCollected;
  const potTarget = cycleIsPopulated
    ? pickPositiveNumber(cycle?.potTarget, mock.potTarget)
    : mock.potTarget;
  const currentCycle = cycleIsPopulated
    ? pickPositiveNumber(cycle?.currentCycle, mock.currentCycle)
    : mock.currentCycle;
  const nextPayoutDate = cycleIsPopulated
    ? pickNonEmptyDate(cycle?.nextPayoutDate, mock.nextPayoutDate)
    : mock.nextPayoutDate;

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
