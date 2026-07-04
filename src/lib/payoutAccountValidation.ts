const NUBAN_LENGTH = 10;

export function isValidNuban(accountNumber: string): boolean {
  const digits = accountNumber.replace(/\D/g, "");
  return digits.length === NUBAN_LENGTH && /^\d{10}$/.test(digits);
}

export function normalizeAccountNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, NUBAN_LENGTH);
}
