import type { ApiEnvelope } from "../models/auth";
import type {
  PayoutAccount,
  PayoutAccountStatus,
} from "../models/payoutAccount";
import type { SetupBankPayload } from "../models/payoutAccount";
import {
  getStoredPayoutAccount,
  setStoredPayoutAccount,
} from "../lib/payoutAccountStorage";

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function success<T>(message: string, data: T): ApiEnvelope<T> {
  return { success: true, message, data };
}

export async function mockGetPayoutAccountStatus(
  userId: string,
): Promise<ApiEnvelope<PayoutAccountStatus>> {
  await mockDelay();

  const account = await getStoredPayoutAccount(userId);

  return success("Payout account status loaded", {
    configured: account !== null,
    account,
  });
}

export async function mockSetupBank(
  payload: SetupBankPayload,
  userId: string,
  bankName: string,
): Promise<ApiEnvelope<PayoutAccountStatus>> {
  await mockDelay();

  const account: PayoutAccount = {
    bankCode: payload.bankCode,
    bankName,
    accountNumber: payload.accountNumber,
    accountName: payload.accountName,
  };

  await setStoredPayoutAccount(userId, account);

  return success("Bank details configured successfully", {
    configured: true,
    account,
  });
}
