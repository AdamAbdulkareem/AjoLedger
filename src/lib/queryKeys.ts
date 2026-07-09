export const queryKeys = {
  currentUser: (token: string | null) => ["user", "me", token] as const,
  banks: (token: string | null) => ["banks", token] as const,
  groups: (token: string | null) => ["groups", token] as const,
  groupDetails: (
    token: string | null,
    groupId: string,
    expectedParticipants?: number,
  ) => ["groups", groupId, token, expectedParticipants] as const,
  recentActivity: (token: string | null) => ["activity", "recent", token] as const,
};
