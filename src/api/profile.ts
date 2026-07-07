import type {
  UpdateProfilePayload,
  UpdateProfileResult,
  UserProfile,
} from "../models/profile";
import type { UserWithPayout } from "../models/bank";
import { getCurrentUser } from "./banks";
import { apiRequest } from "./client";

export type UserIdentity = {
  profile: UserProfile;
  email: string;
};

export function userProfileFromMe(
  user: UserWithPayout,
  fallback?: Partial<UserProfile>,
): UserProfile {
  return {
    fullName: user.name?.trim() || fallback?.fullName || "",
    phoneNumber: fallback?.phoneNumber ?? "",
    avatarUri: fallback?.avatarUri ?? null,
  };
}

export async function getUserIdentity(
  token: string,
  _userId: string,
  _email: string,
): Promise<UserIdentity> {
  void _userId;
  void _email;

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
  _userId: string,
  _currentEmail: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  void _userId;
  void _currentEmail;

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
  _userId: string,
  _email: string,
  avatarUri: string | null,
): Promise<UserProfile> {
  void _userId;
  void _email;

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
  _userId: string,
  _email: string,
): Promise<UserProfile> {
  void _userId;
  void _email;

  const envelope = await apiRequest<UserProfile>("/users/me/profile/avatar", {
    method: "DELETE",
    token,
  });
  if (!envelope.data) {
    throw new Error("Avatar delete returned no data.");
  }
  return envelope.data;
}
