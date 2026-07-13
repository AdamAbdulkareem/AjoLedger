export const TRANSACTION_PIN_LENGTH = 4;

export function normalizeTransactionPin(input: string): string {
  return input.replace(/\D/g, "").slice(0, TRANSACTION_PIN_LENGTH);
}

export function isValidTransactionPin(pin: string): boolean {
  return new RegExp(`^\\d{${TRANSACTION_PIN_LENGTH}}$`).test(pin);
}
