export type GroupStatus = "active" | "pending" | "completed";

export type CycleFrequency = "monthly" | "weekly";

export type SavingsGroupSummary = {
  id: string;
  name: string;
  status: GroupStatus;
  cycleFrequency: CycleFrequency;
  /** Amount in naira (major units). */
  amountPerMember: number;
};

export type ContributionProgress = {
  percent: number;
  /** Amount in naira (major units). */
  amountPaid: number;
  /** Amount in naira (major units). */
  expectedTotal: number;
};

export type PayoutInfo = {
  /** ISO date string. */
  date: string;
  daysRemaining: number;
};

export type NextContribution = {
  /** Amount in naira (major units). */
  amount: number;
  /** ISO date string. */
  dueDate: string;
  daysUntilDue: number;
};

export type ActivityType =
  | "payment_received"
  | "contribution_reminder"
  | "upcoming_payout";

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  /** ISO date/time string for client-side formatting. */
  occurredAt: string;
  /** Amount in naira when shown on the right. */
  amount?: number;
  /** Recipient name for upcoming payout items. */
  recipientName?: string;
  showChevron?: boolean;
};

/** Aggregated dashboard payload — backend may split these across endpoints later. */
export type HomeDashboard = {
  displayName: string;
  avatarUrl: string | null;
  group: SavingsGroupSummary;
  progress: ContributionProgress;
  payout: PayoutInfo;
  nextContribution: NextContribution;
  recentActivity: RecentActivityItem[];
};

export type HomeTabKey =
  | "home"
  | "groups"
  | "contributions"
  | "payouts"
  | "profile";
