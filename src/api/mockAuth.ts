import { ApiError } from "./client";
import type { ApiEnvelope, AuthData, User } from "../models/auth";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

const mockUsers = new Map<string, { password: string; user: User }>();

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function mockAccessToken(email: string): string {
  return `mock.${encodeURIComponent(email)}.${Date.now()}`;
}

function success<T>(message: string, data: T): ApiEnvelope<T> {
  return { success: true, message, data };
}

function ensurePinLength(pin: string) {
  if (!/^\d{4}$/.test(pin)) {
    throw new ApiError("PIN must be 4 digits.");
  }
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

  if (existing && existing.password !== payload.password) {
    throw new ApiError("Invalid email or password.");
  }

  const user: User = existing?.user ?? {
    id: `mock-${email.replace(/[^a-z0-9]/g, "-")}`,
    email,
  };

  if (!existing) {
    mockUsers.set(email, { password: payload.password, user });
  }

  return success("User logged in successfully", {
    accessToken: mockAccessToken(email),
    user,
  });
}

export async function mockSetupTransactionPin(
  transactionPin: string,
): Promise<ApiEnvelope<null>> {
  await mockDelay();
  ensurePinLength(transactionPin);
  return success("Transaction PIN set successfully", null);
}

export async function mockVerifyTransactionPin(
  transactionPin: string,
): Promise<ApiEnvelope<null>> {
  await mockDelay();
  ensurePinLength(transactionPin);
  return success("Transaction PIN verified", null);
}
