import { ApiError } from "./client";
import { deriveDisplayName } from "../lib/greeting";
import { getStoredProfile, setStoredProfile } from "../lib/profileStorage";
import { normalizeEmail } from "../lib/authValidation";
import type { UpdateProfilePayload, UpdateProfileResult, UserProfile } from "../models/profile";
import { mockUpdateUserEmail } from "./mockAuth";

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function defaultProfile(email: string): UserProfile {
  return {
    fullName: deriveDisplayName(email) ?? "Member",
    phoneNumber: "",
    avatarUri: null,
  };
}

export async function mockGetUserProfile(
  userId: string,
  email: string,
): Promise<UserProfile> {
  await mockDelay();
  const stored = await getStoredProfile(userId);
  return stored ?? defaultProfile(email);
}

export async function mockUpdateUserProfile(
  userId: string,
  currentEmail: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  await mockDelay();

  const email = normalizeEmail(payload.email);
  if (email !== normalizeEmail(currentEmail)) {
    mockUpdateUserEmail(userId, email);
  }

  const profile: UserProfile = {
    fullName: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    avatarUri: (await getStoredProfile(userId))?.avatarUri ?? null,
  };

  await setStoredProfile(userId, profile);

  return { profile, email };
}

export async function mockUpdateUserAvatar(
  userId: string,
  email: string,
  avatarUri: string | null,
): Promise<UserProfile> {
  await mockDelay();

  const existing = (await getStoredProfile(userId)) ?? defaultProfile(email);
  const profile: UserProfile = { ...existing, avatarUri };
  await setStoredProfile(userId, profile);
  return profile;
}

export async function mockDeleteUserAvatar(
  userId: string,
  email: string,
): Promise<UserProfile> {
  return mockUpdateUserAvatar(userId, email, null);
}
