import type { Bank } from "../models/bank";

export function findBankByCode(
  banks: Bank[],
  bankCode: string,
): Bank | undefined {
  return banks.find((bank) => bank.bankCode === bankCode);
}
