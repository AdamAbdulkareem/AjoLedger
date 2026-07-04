const NUBAN_LENGTH = 10;

export function isValidNuban(accountNumber: string): boolean {
  return /^\d{10}$/.test(normalizeAccountNumber(accountNumber));
}

export function normalizeAccountNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, NUBAN_LENGTH);
}
