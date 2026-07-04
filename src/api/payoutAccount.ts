import { USE_MOCK_AUTH } from "../config/api";
import type {
  PayoutAccount,
  PayoutAccountStatus,
  SavePayoutAccountPayload,
} from "../models/payoutAccount";
import { apiRequest } from "./client";
import {
  mockGetPayoutAccountStatus,
  mockSavePayoutAccount,
} from "./mockPayoutAccount";

/**
 * Payout account for receiving Ajo contributions.
 * TODO(backend): confirm `/users/me/payout-account` contract with Sherif.
 */
export async function getPayoutAccountStatus(
  token: string,
  userId: string,
): Promise<PayoutAccountStatus> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockGetPayoutAccountStatus(userId);
    if (!envelope.data) {
      throw new Error("Mock payout account status returned no data.");
    }
    return envelope.data;
  }

  const envelope = await apiRequest<PayoutAccountStatus>(
    "/users/me/payout-account",
    { token },
  );
  if (!envelope.data) {
    throw new Error("Payout account status returned no data.");
  }
  return envelope.data;
}

export async function savePayoutAccount(
  token: string,
  userId: string,
  payload: SavePayoutAccountPayload,
): Promise<PayoutAccount> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockSavePayoutAccount(userId, payload);
    if (!envelope.data) {
      throw new Error("Mock payout account save returned no data.");
    }
    return envelope.data;
  }

  const envelope = await apiRequest<PayoutAccount>(
    "/users/me/payout-account",
    { method: "POST", body: payload, token },
  );
  if (!envelope.data) {
    throw new Error("Payout account save returned no data.");
  }
  return envelope.data;
}
