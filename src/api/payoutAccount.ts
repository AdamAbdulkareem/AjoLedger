import { USE_MOCK_AUTH } from "../config/api";
import type { PayoutAccountStatus } from "../models/payoutAccount";
import type { SetupBankPayload } from "../models/payoutAccount";
import {
  findBankName,
  getBanks,
  getCurrentUser,
  isPayoutConfigured,
  payoutAccountFromUser,
  setupBank,
} from "./banks";
import { apiRequest } from "./client";
import {
  mockGetPayoutAccountStatus,
  mockSetupBank,
} from "./mockPayoutAccount";

export async function getPayoutAccountStatus(
  token: string,
  _userId: string,
): Promise<PayoutAccountStatus> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockGetPayoutAccountStatus(_userId);
    if (!envelope.data) {
      throw new Error("Mock payout account status returned no data.");
    }
    return envelope.data;
  }

  const user = await getCurrentUser(token);
  const configured = isPayoutConfigured(user);

  if (!configured) {
    return { configured: false, account: null };
  }

  let bankName: string | undefined;
  try {
    const banks = await getBanks(token);
    bankName = findBankName(banks, user.payoutBankCode!);
  } catch {
    bankName = undefined;
  }

  return {
    configured: true,
    account: payoutAccountFromUser(user, bankName),
  };
}

export async function saveSetupBank(
  token: string,
  payload: SetupBankPayload,
  userId?: string,
  bankName?: string,
): Promise<PayoutAccountStatus> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockSetupBank(
      payload,
      userId ?? "mock-user",
      bankName ?? payload.bankCode,
    );
    if (!envelope.data) {
      throw new Error("Mock bank setup returned no data.");
    }
    return envelope.data;
  }

  const user = await setupBank(token, payload);
  return {
    configured: isPayoutConfigured(user),
    account: payoutAccountFromUser(user),
  };
}

/** @deprecated Use saveSetupBank for onboarding bank setup. */
export async function savePayoutAccount(
  token: string,
  userId: string,
  payload: SetupBankPayload & { bankName?: string },
): Promise<PayoutAccountStatus> {
  void userId;
  return saveSetupBank(token, {
    bankCode: payload.bankCode,
    accountNumber: payload.accountNumber,
    accountName: payload.accountName,
  });
}

/** Re-export for profile gate refresh fallback. */
export { getCurrentUser } from "./banks";
