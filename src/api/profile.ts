import type {
  UpdateProfilePayload,
  UpdateProfileResult,
  UserProfile,
} from "../models/profile";
import type { UserWithPayout } from "../models/bank";
import { getCurrentUser } from "./banks";
import { apiRequest } from "./client";
import { joinFullName, splitFullName } from "../lib/nameUtils";
import { normalizeUserWithPayoutFromApi } from "../lib/userApiNormalize";
import {
  getStoredProfile,
  setStoredProfile,
} from "../lib/profileStorage";

export type UserIdentity = {
  profile: UserProfile;
  email: string;
};

export function userProfileFromMe(
  user: UserWithPayout,
  fallback?: Partial<UserProfile>,
): UserProfile {
  const fullName =
    joinFullName(user.firstName, user.lastName, user.name) ||
    fallback?.fullName ||
    "";

  return {
    fullName,
    phoneNumber: user.phoneNumber?.trim() || fallback?.phoneNumber || "",
    avatarUri: fallback?.avatarUri ?? null,
  };
}

export async function getUserIdentity(
  token: string,
  userId: string,
  _email: string,
): Promise<UserIdentity> {
  void _email;

  const user = await getCurrentUser(token);
  const stored = await getStoredProfile(userId);
  return {
    profile: userProfileFromMe(user, stored ?? undefined),
    email: user.email,
  };
}

/** @deprecated Use getUserIdentity — kept for call sites that only need profile fields. */
export async function getUserProfile(
  token: string,
  userId: string,
  email: string,
): Promise<UserProfile> {
  const identity = await getUserIdentity(token, userId, email);
  return identity.profile;
}

export async function updateUserProfile(
  token: string,
  userId: string,
  _currentEmail: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  void _currentEmail;

  const { firstName, lastName } = splitFullName(payload.fullName);

  const envelope = await apiRequest<unknown>("/users/me", {
    method: "PATCH",
    body: {
      firstName,
      lastName,
      phoneNumber: payload.phoneNumber.trim() || undefined,
    },
    token,
  });

  const patchedUser = envelope.data
    ? normalizeUserWithPayoutFromApi(envelope.data)
    : await getCurrentUser(token);

  const stored = await getStoredProfile(userId);
  const profile: UserProfile = {
    ...userProfileFromMe(patchedUser, {
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      avatarUri: stored?.avatarUri ?? null,
    }),
    avatarUri: stored?.avatarUri ?? null,
  };
  await setStoredProfile(userId, profile);

  return {
    profile,
    email: patchedUser.email,
  };
}

/** Avatar is stored on-device until the API ships an upload endpoint. */
export async function updateUserAvatar(
  token: string,
  userId: string,
  email: string,
  avatarUri: string | null,
): Promise<UserProfile> {
  void token;
  void email;

  const user = await getStoredProfile(userId);
  const profile: UserProfile = {
    fullName: user?.fullName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    avatarUri,
  };
  await setStoredProfile(userId, profile);
  return profile;
}

export async function deleteUserAvatar(
  token: string,
  userId: string,
  email: string,
): Promise<UserProfile> {
  return updateUserAvatar(token, userId, email, null);
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  token: string,
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiRequest("/auth/password", {
    method: "PATCH",
    body: payload,
    token,
  });
}

export type DeleteAccountInitiateResult = {
  otp?: string;
};

export async function initiateAccountDeletion(
  token: string,
  reason?: string,
): Promise<DeleteAccountInitiateResult> {
  const envelope = await apiRequest<{ otp?: string }>(
    "/users/me/delete/initiate",
    {
      method: "POST",
      body: reason ? { reason } : {},
      token,
    },
  );

  return { otp: envelope.data?.otp };
}

export async function verifyAccountDeletion(
  token: string,
  otp: string,
): Promise<void> {
  await apiRequest("/users/me/delete/verify", {
    method: "POST",
    body: { otp },
    token,
  });
}

export async function reactivateAccount(token: string): Promise<void> {
  await apiRequest("/users/me/reactivate", {
    method: "POST",
    token,
  });
}
