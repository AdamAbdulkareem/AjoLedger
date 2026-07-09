export type ContributionFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

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
};

export type GroupCycleDetails = {
  currentCycle?: number;
  contributionAmount?: number;
  potCollected?: number;
  potTarget?: number;
  nextPayoutDate?: string;
};

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
};

export type CreateGroupPayload = {
  name: string;
  description?: string;
  frequency: ContributionFrequency;
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
