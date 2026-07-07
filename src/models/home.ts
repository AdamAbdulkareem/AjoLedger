export type GroupContributionStatusKey = "partial" | "paid" | "notPaid";

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
  memberCount: number;
  payoutNumber: number;
  /** Amount in naira already paid toward current payout cycle. */
  payoutAmountPaid: number;
  /** Total amount in naira for current payout cycle. */
  payoutAmountTotal: number;
};

export type PayoutInfo = {
  /** ISO date string. */
  date: string;
  daysRemaining: number;
};

export type AmountRemains = {
  /** Amount in naira (major units). */
  amount: number;
  /** ISO date string. */
  dueDate: string;
  daysUntilDue: number;
};

export type ActivityType =
  | "payment_paid"
  | "contribution_reminder"
  | "upcoming_payout";

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  /** ISO date/time string for client-side formatting. */
  occurredAt: string;
  /** Amount in naira for payment items (shown in subtitle). */
  amount?: number;
  /** Recipient name for upcoming payout items. */
  recipientName?: string;
  /** Source group — used for multi-group activity tag pills. */
  groupId?: string;
  groupName?: string;
};

export type CarouselProgressTone = "urgent" | "success" | "neutral";

/** Aggregated dashboard payload — backend may split these across endpoints later. */
export type HomeDashboard = {
  displayName: string;
  avatarUrl: string | null;
  group: SavingsGroupSummary;
  progress: ContributionProgress;
  payout: PayoutInfo;
  amountRemains: AmountRemains;
  recentActivity: RecentActivityItem[];
};

export type HomeTabKey = "home" | "groups" | "profile";

export type GroupHomeDashboard = {
  groupId: string;
  contributionStatusKey: GroupContributionStatusKey;
  group: SavingsGroupSummary;
  progress: ContributionProgress;
  payout: PayoutInfo;
  amountRemains: AmountRemains;
};

/** Registered-user home payload built from GET /groups. */
export type RegisteredHomeData = {
  displayName: string;
  avatarUrl: string | null;
  groups: GroupHomeDashboard[];
  /** Sum of outstanding amounts due this week across active groups. */
  totalDueThisWeek: number;
  recentActivity: RecentActivityItem[];
};
