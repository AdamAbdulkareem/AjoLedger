import { ApiError, apiRequest } from "./client";
import type { AuthData } from "../models/auth";
import { authDataSchema } from "../lib/schemas/apiSchemas";
import { validateApiPayload } from "../lib/validateApiResponse";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: EmailPasswordPayload) {
  const envelope = await apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });

  if (!envelope.data) {
    throw new Error("Registration returned no data.");
  }

  return {
    ...envelope,
    data: validateApiPayload(authDataSchema, envelope.data, "Registration failed."),
  };
}

export async function loginUser(payload: EmailPasswordPayload) {
  const envelope = await apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (!envelope.data) {
    throw new Error("Login returned no data.");
  }

  return {
    ...envelope,
    data: validateApiPayload(authDataSchema, envelope.data, "Login failed."),
  };
}

export type TransactionPinPayload = {
  transactionPin: string;
};

export async function setupTransactionPin(
  token: string,
  payload: TransactionPinPayload,
): Promise<void> {
  await apiRequest("/auth/setup-transaction-pin", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function verifyTransactionPin(
  token: string,
  payload: TransactionPinPayload,
): Promise<void> {
  await apiRequest("/auth/verify-transaction-pin", {
    method: "POST",
    body: payload,
    token,
  });
}

export type GoogleLoginPayload = {
  idToken: string;
};

export async function googleLoginUser(payload: GoogleLoginPayload) {
  const envelope = await apiRequest<AuthData>("/auth/google", {
    method: "POST",
    body: payload,
  });

  if (!envelope.data) {
    throw new Error("Google sign-in returned no data.");
  }

  return {
    ...envelope,
    data: validateApiPayload(
      authDataSchema,
      envelope.data,
      "Google sign-in failed.",
    ),
  };
}

export function isTransactionPinAlreadyExistsError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("already") &&
    (message.includes("pin") || message.includes("transaction"))
  );
}
