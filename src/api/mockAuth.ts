import { ApiError } from "./client";
import type { ApiEnvelope, AuthData, User } from "../models/auth";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

const mockUsers = new Map<string, { password: string; user: User }>();

export function mockUpdateUserEmail(userId: string, newEmail: string): User {
  for (const [key, entry] of mockUsers.entries()) {
    if (entry.user.id !== userId) continue;

    if (key !== newEmail && mockUsers.has(newEmail)) {
      throw new ApiError("An account with this email already exists.");
    }

    const updatedUser: User = { ...entry.user, email: newEmail };
    mockUsers.delete(key);
    mockUsers.set(newEmail, { ...entry, user: updatedUser });
    return updatedUser;
  }

  throw new ApiError("User not found.");
}

const INVALID_CREDENTIALS = "Invalid email or password.";

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function mockAccessToken(email: string): string {
  return `mock.${encodeURIComponent(email)}.${Date.now()}`;
}

function success<T>(message: string, data: T): ApiEnvelope<T> {
  return { success: true, message, data };
}

export async function mockRegister(
  payload: EmailPasswordPayload,
): Promise<ApiEnvelope<AuthData>> {
  await mockDelay();

  const email = payload.email.trim().toLowerCase();
  if (mockUsers.has(email)) {
    throw new ApiError("An account with this email already exists.");
  }

  const user: User = {
    id: `mock-${email.replace(/[^a-z0-9]/g, "-")}`,
    email,
  };

  mockUsers.set(email, { password: payload.password, user });

  return success("User registered successfully", {
    accessToken: mockAccessToken(email),
    user,
  });
}

export async function mockLogin(
  payload: EmailPasswordPayload,
): Promise<ApiEnvelope<AuthData>> {
  await mockDelay();

  const email = payload.email.trim().toLowerCase();
  const existing = mockUsers.get(email);

  if (!existing) {
    throw new ApiError(INVALID_CREDENTIALS);
  }

  if (existing.password !== payload.password) {
    throw new ApiError(INVALID_CREDENTIALS);
  }

  return success("User logged in successfully", {
    accessToken: mockAccessToken(email),
    user: existing.user,
  });
}
