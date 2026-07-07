import type { ContributionFrequency, GroupSummary } from "../models/group";
import type {
  CycleFrequency,
  GroupStatus,
  HomeDashboard,
} from "../models/home";

function mapCycleFrequency(
  frequency?: ContributionFrequency,
): CycleFrequency {
  if (frequency === "WEEKLY" || frequency === "DAILY") {
    return "weekly";
  }
  return "monthly";
}

function inferGroupStatus(group: GroupSummary): GroupStatus {
  const joined = group.joinedCount ?? 0;
  const total = group.numberOfParticipants ?? 0;

  if (total > 0 && joined >= total) {
    return "active";
  }

  return "pending";
}

function addDays(from: Date, days: number): string {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function daysUntil(isoDate: string): number {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function cycleLengthDays(frequency?: ContributionFrequency): number {
  switch (frequency) {
    case "DAILY":
      return 1;
    case "WEEKLY":
      return 7;
    case "MONTHLY":
    default:
      return 30;
  }
}

/** Builds the returning-user home payload from GET /groups data. */
export function buildHomeDashboardFromGroups(
  groups: GroupSummary[],
  displayName: string,
  avatarUrl: string | null = null,
): HomeDashboard | null {
  const primary = groups[0];
  if (!primary) {
    return null;
  }

  const joinedCount = primary.joinedCount ?? 0;
  const participantCount = Math.max(primary.numberOfParticipants ?? 1, 1);
  const contributionAmount = primary.contributionAmount ?? 0;
  const dueDate = addDays(new Date(), cycleLengthDays(primary.frequency));

  return {
    displayName,
    avatarUrl,
    group: {
      id: primary.id,
      name: primary.name,
      status: inferGroupStatus(primary),
      cycleFrequency: mapCycleFrequency(primary.frequency),
      amountPerMember: contributionAmount,
    },
    progress: {
      percent: Math.min(
        100,
        Math.round((joinedCount / participantCount) * 100),
      ),
      memberCount: joinedCount,
      payoutNumber: 1,
      payoutAmountPaid: 0,
      payoutAmountTotal: contributionAmount * participantCount,
    },
    payout: {
      date: dueDate,
      daysRemaining: daysUntil(dueDate),
    },
    amountRemains: {
      amount: contributionAmount,
      dueDate,
      daysUntilDue: daysUntil(dueDate),
    },
    recentActivity: [],
  };
}
