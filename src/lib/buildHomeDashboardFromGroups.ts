import type { ContributionFrequency, GroupSummary } from "../models/group";
import type {
  CycleFrequency,
  GroupHomeDashboard,
  GroupStatus,
  RecentActivityItem,
  RegisteredHomeData,
} from "../models/home";
import { buildGroupListCardViewModel } from "./buildGroupListCardViewModel";

function mapCycleFrequency(
  frequency?: ContributionFrequency,
): CycleFrequency {
  if (frequency === "WEEKLY" || frequency === "DAILY") {
    return "weekly";
  }
  return "monthly";
}

function daysUntil(isoDate: string): number {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function inferGroupStatus(
  group: GroupSummary,
  statusKey: ReturnType<typeof buildGroupListCardViewModel>["statusKey"],
): GroupStatus {
  if (statusKey === "paid") {
    return "active";
  }

  const joined = group.joinedCount ?? 0;
  const total = group.numberOfParticipants ?? 0;

  if (total > 0 && joined >= total) {
    return "active";
  }

  return "pending";
}

function buildGroupHomeDashboard(
  group: GroupSummary,
  index: number,
): GroupHomeDashboard {
  const viewModel = buildGroupListCardViewModel(group, index);
  const joinedCount = group.joinedCount ?? 0;

  return {
    groupId: group.id,
    contributionStatusKey: viewModel.statusKey,
    group: {
      id: group.id,
      name: group.name,
      status: inferGroupStatus(group, viewModel.statusKey),
      cycleFrequency: mapCycleFrequency(group.frequency),
      amountPerMember: viewModel.contributionAmount,
    },
    progress: {
      percent: viewModel.progressPercent,
      memberCount: joinedCount,
      payoutNumber: viewModel.currentCycle,
      payoutAmountPaid: viewModel.potCollected,
      payoutAmountTotal: viewModel.potTarget,
    },
    payout: {
      date: viewModel.nextPayoutDate,
      daysRemaining: daysUntil(viewModel.nextPayoutDate),
    },
    amountRemains: {
      amount:
        viewModel.statusKey === "paid" ? 0 : viewModel.contributionAmount,
      dueDate: viewModel.nextPayoutDate,
      daysUntilDue: daysUntil(viewModel.nextPayoutDate),
    },
  };
}

function shortGroupTag(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? name;
  return firstWord.length > 8 ? `${firstWord.slice(0, 8)}…` : firstWord;
}

function buildMockRecentActivity(
  dashboards: GroupHomeDashboard[],
): RecentActivityItem[] {
  if (dashboards.length === 0) {
    return [];
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const pick = (index: number) => dashboards[index % dashboards.length];

  const reminderGroup = pick(0);
  const paymentGroup = pick(1);
  const payoutGroup = pick(2);

  return [
    {
      id: "mock-reminder",
      type: "contribution_reminder",
      occurredAt: now.toISOString(),
      groupId: reminderGroup.groupId,
      groupName: shortGroupTag(reminderGroup.group.name),
    },
    {
      id: "mock-payment",
      type: "payment_paid",
      occurredAt: yesterday.toISOString(),
      amount: paymentGroup.group.amountPerMember,
      groupId: paymentGroup.groupId,
      groupName: shortGroupTag(paymentGroup.group.name),
    },
    {
      id: "mock-payout",
      type: "upcoming_payout",
      occurredAt: lastWeek.toISOString(),
      recipientName: "Ibrahim Sherif",
      groupId: payoutGroup.groupId,
      groupName: shortGroupTag(payoutGroup.group.name),
    },
  ];
}

function computeTotalDueThisWeek(groups: GroupHomeDashboard[]): number {
  return groups.reduce((sum, entry) => sum + entry.amountRemains.amount, 0);
}

/** Builds registered-user home data from GET /groups. */
export function buildRegisteredHomeData(
  groups: GroupSummary[],
  displayName: string,
  avatarUrl: string | null = null,
): RegisteredHomeData | null {
  if (groups.length === 0) {
    return null;
  }

  const groupDashboards = groups.map((group, index) =>
    buildGroupHomeDashboard(group, index),
  );

  return {
    displayName,
    avatarUrl,
    groups: groupDashboards,
    totalDueThisWeek: computeTotalDueThisWeek(groupDashboards),
    recentActivity: buildMockRecentActivity(groupDashboards),
  };
}

/** @deprecated Use buildRegisteredHomeData — kept for speech helper compatibility. */
export function buildHomeDashboardFromGroups(
  groups: GroupSummary[],
  displayName: string,
  avatarUrl: string | null = null,
) {
  const registered = buildRegisteredHomeData(groups, displayName, avatarUrl);
  const primary = registered?.groups[0];
  if (!registered || !primary) {
    return null;
  }

  return {
    displayName: registered.displayName,
    avatarUrl: registered.avatarUrl,
    group: primary.group,
    progress: primary.progress,
    payout: primary.payout,
    amountRemains: primary.amountRemains,
    recentActivity: registered.recentActivity,
  };
}
