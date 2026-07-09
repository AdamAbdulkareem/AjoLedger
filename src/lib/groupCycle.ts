import type { GroupCycleDetails, GroupDetails, GroupSummary } from "../models/group";

type CycleCarrier = {
  hasActiveCycle?: boolean;
  cycleDetails?: GroupCycleDetails;
};

/** True when the group has a started contribution cycle (post payout-order). */
export function hasActiveGroupCycle(group: CycleCarrier | null | undefined): boolean {
  if (!group) {
    return false;
  }

  if (group.hasActiveCycle === true) {
    return true;
  }

  const cycle = group.cycleDetails?.currentCycle;
  return cycle != null && cycle >= 1;
}

export function isPreCycleGroup(
  group: Pick<GroupDetails, "hasActiveCycle" | "cycleDetails">,
): boolean {
  return !hasActiveGroupCycle(group);
}
