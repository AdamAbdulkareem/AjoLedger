import { z } from "zod";

import type { AuthData, User } from "../../models/auth";

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
});

export const authDataSchema = z.object({
  accessToken: z.string().min(1),
  user: userSchema,
});

export const createdGroupSchema = z.object({
  id: z.string().min(1),
  inviteCode: z.string().min(1),
  name: z.string().optional(),
});

export const joinGroupResultSchema = z.object({
  groupId: z.string().min(1),
  membershipId: z.string().min(1),
});

export function parseAuthData(data: unknown): AuthData {
  return authDataSchema.parse(data);
}

export function parseUser(data: unknown): User {
  return userSchema.parse(data);
}

export function parseCreatedGroup(data: unknown) {
  return createdGroupSchema.parse(data);
}

export function parseJoinGroupResult(data: unknown) {
  return joinGroupResultSchema.parse(data);
}

/** Validates normalized group summaries have required identifiers. */
export const groupSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});

export function assertValidGroupSummaries(groups: unknown[]): void {
  for (const group of groups) {
    groupSummarySchema.parse(group);
  }
}
