import {
  mapContributionStatusKey,
  type GroupContributionStatusKey,
} from "./buildGroupListCardViewModel";
import { resolveContributionDueDate } from "./resolveOutstandingContribution";
import type { GroupDetails, GroupMember } from "../models/group";

export type PayoutScheduleRowStatus = "next" | "upcoming" | "processing";

export type PayoutScheduleRow = {
  member: GroupMember;
  payoutTurn: number;
  status: PayoutScheduleRowStatus;
};

export type CompletedPayoutRow = {
  member: GroupMember;
  payoutTurn: number;
};

export type PayoutScheduleViewModel = {
  currentRound: number;
  potTarget: number;
  dueDate: string;
  cycleId: string | null;
  nextRecipient: GroupMember | null;
  scheduleRows: PayoutScheduleRow[];
  completedRows: CompletedPayoutRow[];
  allMembersPaid: boolean;
  canDisburse: boolean;
  isProcessing: boolean;
};

function memberPaymentStatusKey(member: GroupMember): GroupContributionStatusKey {
  const raw = member.contributionStatus?.trim();
  if (!raw) {
    return "notPaid";
  }

  return mapContributionStatusKey(raw);
}

function isMemberPaid(member: GroupMember): boolean {
  return memberPaymentStatusKey(member) === "paid";
}

function sortByPayoutTurn(members: GroupMember[]): GroupMember[] {
  return [...members]
    .filter((member) => member.payoutTurn != null && member.payoutTurn > 0)
    .sort((left, right) => (left.payoutTurn ?? 0) - (right.payoutTurn ?? 0));
}

export function buildPayoutScheduleViewModel(
  group: GroupDetails,
  options?: { pendingRound?: number | null },
): PayoutScheduleViewModel {
  const cycle = group.cycleDetails;
  const currentRound = Math.max(cycle?.currentCycle ?? cycle?.currentWeek ?? 1, 1);
  const potTarget = cycle?.potTarget ?? cycle?.expectedAmount ?? 0;
  const dueDate = resolveContributionDueDate(cycle?.dueDate, cycle?.nextPayoutDate);
  const cycleId = cycle?.cycleId?.trim() || null;

  const roster = sortByPayoutTurn(group.members);
  const pendingRound = options?.pendingRound ?? null;
  const isProcessing =
    pendingRound != null && pendingRound > 0 && pendingRound === currentRound;

  const completedRows: CompletedPayoutRow[] = roster
    .filter((member) => (member.payoutTurn ?? 0) < currentRound)
    .map((member) => ({
      member,
      payoutTurn: member.payoutTurn!,
    }));

  const scheduleRows: PayoutScheduleRow[] = roster
    .filter((member) => (member.payoutTurn ?? 0) >= currentRound)
    .map((member) => {
      const payoutTurn = member.payoutTurn!;
      let status: PayoutScheduleRowStatus = "upcoming";

      if (payoutTurn === currentRound) {
        status = isProcessing ? "processing" : "next";
      }

      return { member, payoutTurn, status };
    });

  const nextRecipient =
    roster.find((member) => member.payoutTurn === currentRound) ?? null;

  const allMembersPaid =
    roster.length > 0 && roster.every((member) => isMemberPaid(member));

  const canDisburse = allMembersPaid && !isProcessing && !!cycleId;

  return {
    currentRound,
    potTarget,
    dueDate,
    cycleId,
    nextRecipient,
    scheduleRows,
    completedRows,
    allMembersPaid,
    canDisburse,
    isProcessing,
  };
}
