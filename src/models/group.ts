export type ContributionFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

/** All `*Amount` / `pot*` money fields on group types are naira after API normalization. */

export type GroupMemberStatus = "JOINED" | "PENDING";

export type GroupMember = {
  id: string;
  name: string;
  status: GroupMemberStatus;
  /** Backend membership role (e.g. OWNER, ADMIN, MEMBER). */
  role?: string;
  /** Linked user id when the API includes it. */
  userId?: string;
  email?: string;
  /** True when this member row is the authenticated user. */
  isMe?: boolean;
  /** 1-indexed payout turn when assigned by the group admin. */
  payoutTurn?: number | null;
  /** Per-member contribution status for the active cycle week (when API provides it). */
  contributionStatus?: MemberContributionStatus | string;
  /** Amount still due for the current week (naira integer). */
  dueAmount?: number | null;
};

export type PayoutTurnAssignment = {
  membershipId: string;
  payoutTurn: number;
};

export type AssignPayoutOrderPayload = {
  assignments: PayoutTurnAssignment[];
};

export type GroupMyDetails = {
  position?: number | null;
  status?: string;
  role?: string;
  virtualAccountNumber?: string;
  virtualBankName?: string;
  virtualAccountName?: string;
  /** Amount still owed for the current cycle (naira). */
  dueAmount?: number | null;
  /** Amount already paid toward the current cycle (naira). */
  amountPaid?: number | null;
};

export type GroupCycleDetails = {
  /** Active cycle UUID from `activeCycle.id` — required for disburse. */
  cycleId?: string;
  currentCycle?: number;
  /** Current contribution week/round within the active cycle. */
  currentWeek?: number;
  totalWeeks?: number;
  contributionAmount?: number;
  /** Total inbound transfer including Nomba processing fee (naira). */
  grossContributionAmount?: number;
  /** Current user's payment status for the active cycle. */
  myContributionStatus?: string;
  potCollected?: number;
  potTarget?: number;
  nextPayoutDate?: string;
  dueDate?: string;
  expectedAmount?: number;
};

export type MemberContributionStatus = "PAID" | "PENDING" | "NOT_PAID";

export type GroupSummary = {
  id: string;
  name: string;
  description?: string;
  inviteCode?: string;
  isCreator?: boolean;
  contributionAmount?: number;
  frequency?: ContributionFrequency;
  numberOfParticipants?: number;
  joinedCount?: number;
  myDetails?: GroupMyDetails;
  cycleDetails?: GroupCycleDetails;
  /** True after POST /groups/:id/cycles — cycle is live. */
  hasActiveCycle?: boolean;
};

export type GroupDetails = {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  numberOfParticipants: number;
  joinedCount: number;
  members: GroupMember[];
  isCreator?: boolean;
  contributionAmount?: number;
  frequency?: ContributionFrequency;
  myDetails?: GroupMyDetails;
  cycleDetails?: GroupCycleDetails;
  hasActiveCycle?: boolean;
};

export type CreateGroupPayload = {
  name: string;
  description?: string;
  frequency: ContributionFrequency;
  /** Naira; POST /groups sends as-is (backend converts to kobo). */
  contributionAmount: number;
  numberOfParticipants: number;
};

export type CreatedGroup = {
  id: string;
  inviteCode: string;
  name?: string;
};

export type JoinGroupPayload = {
  inviteCode: string;
};

export type JoinGroupResult = {
  groupId: string;
  membershipId: string;
};
