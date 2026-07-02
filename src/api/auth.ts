import { USE_MOCK_AUTH } from "../config/api";
import { apiRequest } from "./client";
import {
  mockLogin,
  mockRegister,
  mockSetupTransactionPin,
  mockVerifyTransactionPin,
} from "./mockAuth";
import type { AuthData } from "../models/auth";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

type TransactionPinPayload = {
  transactionPin: string;
};

export async function registerUser(payload: EmailPasswordPayload) {
  if (USE_MOCK_AUTH) return mockRegister(payload);

  return apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function loginUser(payload: EmailPasswordPayload) {
  if (USE_MOCK_AUTH) return mockLogin(payload);

  return apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function setupTransactionPin(
  token: string,
  transactionPin: string,
  userId?: string,
) {
  if (USE_MOCK_AUTH) {
    if (!userId) {
      throw new Error("userId is required for mock PIN setup.");
    }
    return mockSetupTransactionPin(userId, transactionPin);
  }

  return apiRequest<null>("/auth/setup-transaction-pin", {
    method: "POST",
    token,
    body: { transactionPin } satisfies TransactionPinPayload,
  });
}

/**
 * PIN unlock endpoint — confirm path with backend before disabling mock auth.
 * TODO(backend): verify `/auth/verify-transaction-pin` matches Sherif's contract.
 */
export async function verifyTransactionPin(
  token: string,
  transactionPin: string,
  userId?: string,
) {
  if (USE_MOCK_AUTH) {
    if (!userId) {
      throw new Error("userId is required for mock PIN verification.");
    }
    return mockVerifyTransactionPin(userId, transactionPin);
  }

  return apiRequest<null>("/auth/verify-transaction-pin", {
    method: "POST",
    token,
    body: { transactionPin } satisfies TransactionPinPayload,
  });
}
