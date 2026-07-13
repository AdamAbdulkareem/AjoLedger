import type {
  PayoutAccount,
  PayoutAccountStatus,
  SetupBankPayload,
  UpdatePayoutSettingsPayload,
} from "../models/payoutAccount";
import {
  findBankName,
  getBanks,
  getCurrentUser,
  isPayoutConfigured,
  payoutAccountFromUser,
  setupBank,
  updatePayoutSettings,
} from "./banks";

async function resolveBankName(
  token: string,
  bankCode: string | null | undefined,
): Promise<string | undefined> {
  if (!bankCode) {
    return undefined;
  }

  try {
    const banks = await getBanks(token);
    return findBankName(banks, bankCode);
  } catch {
    return undefined;
  }
}

export async function getPayoutAccountStatus(
  token: string,
  _userId: string,
): Promise<PayoutAccountStatus> {
  void _userId;

  const user = await getCurrentUser(token);
  const configured = isPayoutConfigured(user);

  if (!configured) {
    return { configured: false, account: null };
  }

  const bankName = await resolveBankName(token, user.payoutBankCode);

  return {
    configured: true,
    account: payoutAccountFromUser(user, bankName),
  };
}

export async function saveSetupBank(
  token: string,
  payload: SetupBankPayload,
): Promise<PayoutAccountStatus> {
  const user = await setupBank(token, payload);
  return {
    configured: isPayoutConfigured(user),
    account: payoutAccountFromUser(user),
  };
}

export async function savePayoutSettings(
  token: string,
  payload: UpdatePayoutSettingsPayload,
): Promise<PayoutAccountStatus> {
  const user = await updatePayoutSettings(token, payload);
  const configured = isPayoutConfigured(user);
  const bankName = configured
    ? await resolveBankName(token, user.payoutBankCode)
    : undefined;

  return {
    configured,
    account: payoutAccountFromUser(user, bankName),
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
