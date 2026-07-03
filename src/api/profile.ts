import { USE_MOCK_AUTH } from "../config/api";
import type {
  UpdateProfilePayload,
  UpdateProfileResult,
  UserProfile,
} from "../models/profile";
import { apiRequest } from "./client";
import {
  mockDeleteUserAvatar,
  mockGetUserProfile,
  mockUpdateUserAvatar,
  mockUpdateUserProfile,
} from "./mockProfile";

export async function getUserProfile(
  token: string,
  userId: string,
  email: string,
): Promise<UserProfile> {
  if (USE_MOCK_AUTH) {
    return mockGetUserProfile(userId, email);
  }

  const envelope = await apiRequest<UserProfile>("/users/me/profile", { token });
  if (!envelope.data) {
    throw new Error("Profile returned no data.");
  }
  return envelope.data;
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
