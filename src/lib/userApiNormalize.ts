import { joinFullName } from "./nameUtils";
import type { UserWithPayout } from "../models/bank";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/** Normalizes GET /users/me (and bank setup responses) into app models. */
export function normalizeUserWithPayoutFromApi(raw: unknown): UserWithPayout {
  const record = asRecord(raw) ?? {};

  const firstName = readString(record.firstName);
  const lastName = readString(record.lastName);
  const phoneNumber = readString(record.phoneNumber);
  const name =
    readString(record.name) ??
    joinFullName(firstName, lastName) ??
    "";

  return {
    id: readString(record.id) ?? "",
    name,
    firstName,
    lastName,
    phoneNumber,
    email: readString(record.email) ?? "",
    payoutBankCode: readString(record.payoutBankCode) ?? null,
    payoutAccountNumber: readString(record.payoutAccountNumber) ?? null,
    payoutAccountName: readString(record.payoutAccountName) ?? null,
    hasTransactionPin: readBoolean(record.hasTransactionPin),
    createdAt: readString(record.createdAt) ?? "",
    updatedAt: readString(record.updatedAt) ?? "",
  };
}
