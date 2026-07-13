import type {
  Bank,
  ResolveAccountPayload,
  ResolveAccountResult,
  UserWithPayout,
} from "../models/bank";
import type {
  PayoutAccount,
  SetupBankPayload,
  UpdatePayoutSettingsPayload,
} from "../models/payoutAccount";
import { normalizeUserWithPayoutFromApi } from "../lib/userApiNormalize";
import { apiRequest } from "./client";

const UNKNOWN_BANK_NAME = "Unknown bank";

let cachedBanks: Bank[] | null = null;
let cachedBanksToken: string | null = null;

export function clearBanksCache(): void {
  cachedBanks = null;
  cachedBanksToken = null;
}

export async function getBanks(token: string): Promise<Bank[]> {
  if (cachedBanks && cachedBanksToken === token) {
    return cachedBanks;
  }

  const envelope = await apiRequest<Bank[]>("/users/banks", { token });
  if (!envelope.data) {
    throw new Error("Bank list returned no data.");
  }
  cachedBanks = envelope.data;
  cachedBanksToken = token;
  return envelope.data;
}

export async function resolveAccount(
  token: string,
  payload: ResolveAccountPayload,
): Promise<ResolveAccountResult> {
  const envelope = await apiRequest<ResolveAccountResult>(
    "/users/resolve-account",
    { method: "POST", body: payload, token },
  );
  if (!envelope.data) {
    throw new Error("Account resolution returned no data.");
  }
  return envelope.data;
}

export async function setupBank(
  token: string,
  payload: SetupBankPayload,
): Promise<UserWithPayout> {
  const envelope = await apiRequest<unknown>("/users/setup-bank", {
    method: "POST",
    body: payload,
    token,
  });
  if (!envelope.data) {
    throw new Error("Bank setup returned no data.");
  }
  return normalizeUserWithPayoutFromApi(envelope.data);
}

export async function updatePayoutSettings(
  token: string,
  payload: UpdatePayoutSettingsPayload,
): Promise<UserWithPayout> {
  const envelope = await apiRequest<unknown>("/users/payout-settings", {
    method: "PATCH",
    body: payload,
    token,
  });
  if (!envelope.data) {
    throw new Error("Payout settings update returned no data.");
  }
  return normalizeUserWithPayoutFromApi(envelope.data);
}

export async function getCurrentUser(token: string): Promise<UserWithPayout> {
  const envelope = await apiRequest<unknown>("/users/me", { token });
  if (!envelope.data) {
    throw new Error("User profile returned no data.");
  }
  return normalizeUserWithPayoutFromApi(envelope.data);
}

export function isPayoutConfigured(user: UserWithPayout): boolean {
  return !!user.payoutBankCode?.trim();
}

export function payoutAccountFromUser(
  user: UserWithPayout,
  bankName?: string,
): PayoutAccount | null {
  if (!isPayoutConfigured(user)) return null;

  return {
    bankCode: user.payoutBankCode!,
    bankName: bankName ?? UNKNOWN_BANK_NAME,
    accountNumber: user.payoutAccountNumber ?? "",
    accountName: user.payoutAccountName ?? undefined,
  };
}

export function findBankName(
  banks: Bank[],
  bankCode: string,
): string | undefined {
  return banks.find((bank) => bank.bankCode === bankCode)?.bankName;
}
