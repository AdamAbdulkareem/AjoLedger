export type ContributionFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type GroupMemberStatus = "JOINED" | "PENDING";

export type GroupMember = {
  id: string;
  name: string;
  status: GroupMemberStatus;
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
};

export type GroupDetails = {
  id: string;
  name: string;
  inviteCode: string;
  numberOfParticipants: number;
  joinedCount: number;
  members: GroupMember[];
  isCreator?: boolean;
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
