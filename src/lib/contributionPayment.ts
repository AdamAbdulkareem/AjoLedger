import { readMyDetailsStatus } from "./buildGroupListCardViewModel";
import type { GroupCycleDetails, GroupMyDetails } from "../models/group";

export type GrossTransferBreakdown = {
  netContribution: number;
  grossTransfer: number;
  processingFee: number;
};

/** Net savings + Nomba inbound fee = amount user should transfer. */
export function resolveGrossTransferBreakdown(
  cycle: GroupCycleDetails | undefined,
  fallbackNetContribution = 0,
): GrossTransferBreakdown {
  const netContribution =
    cycle?.contributionAmount != null && cycle.contributionAmount > 0
      ? cycle.contributionAmount
      : fallbackNetContribution;
  const grossTransfer =
    cycle?.grossContributionAmount != null && cycle.grossContributionAmount > 0
      ? cycle.grossContributionAmount
      : netContribution;
  const processingFee =
    grossTransfer > netContribution ? grossTransfer - netContribution : 0;

  return {
    netContribution,
    grossTransfer,
    processingFee,
  };
}

/** Prefer activeCycle.myContributionStatus; fall back to myDetails status fields. */
export function readCycleContributionStatus(
  cycle?: GroupCycleDetails,
  myDetails?: GroupMyDetails,
): string | undefined {
  const cycleStatus = cycle?.myContributionStatus?.trim();
  if (cycleStatus) {
    return cycleStatus;
  }

  return readMyDetailsStatus(myDetails);
}
