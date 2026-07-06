import { USE_MOCK_AUTH } from "../config/api";
import type {
  UpdateProfilePayload,
  UpdateProfileResult,
  UserProfile,
} from "../models/profile";
import type { UserWithPayout } from "../models/bank";
import { getCurrentUser } from "./banks";
import { apiRequest } from "./client";
import {
  mockDeleteUserAvatar,
  mockGetUserProfile,
  mockUpdateUserAvatar,
  mockUpdateUserProfile,
} from "./mockProfile";

export type UserIdentity = {
  profile: UserProfile;
  email: string;
};

export function userProfileFromMe(user: UserWithPayout): UserProfile {
  return {
    fullName: user.name?.trim() || "",
    phoneNumber: "",
    avatarUri: null,
  };
}

export async function getUserIdentity(
  token: string,
  userId: string,
  email: string,
): Promise<UserIdentity> {
  if (USE_MOCK_AUTH) {
    const profile = await mockGetUserProfile(userId, email);
    return { profile, email };
  }

  const user = await getCurrentUser(token);
  return {
    profile: userProfileFromMe(user),
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
  currentEmail: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  if (USE_MOCK_AUTH) {
    return mockUpdateUserProfile(userId, currentEmail, payload);
  }

  const envelope = await apiRequest<UpdateProfileResult>("/users/me/profile", {
    method: "PUT",
    body: payload,
    token,
  });
  if (!envelope.data) {
    throw new Error("Profile update returned no data.");
  }
  return envelope.data;
}

export async function updateUserAvatar(
  token: string,
  userId: string,
  email: string,
  avatarUri: string | null,
): Promise<UserProfile> {
  if (USE_MOCK_AUTH) {
    return mockUpdateUserAvatar(userId, email, avatarUri);
  }

  const envelope = await apiRequest<UserProfile>("/users/me/profile/avatar", {
    method: "PUT",
    body: { avatarUri },
    token,
  });
  if (!envelope.data) {
    throw new Error("Avatar update returned no data.");
  }
  return envelope.data;
}

export async function deleteUserAvatar(
  token: string,
  userId: string,
  email: string,
): Promise<UserProfile> {
  if (USE_MOCK_AUTH) {
    return mockDeleteUserAvatar(userId, email);
  }

  const envelope = await apiRequest<UserProfile>("/users/me/profile/avatar", {
    method: "DELETE",
    token,
  });
  if (!envelope.data) {
    throw new Error("Avatar delete returned no data.");
  }
  return envelope.data;
}
