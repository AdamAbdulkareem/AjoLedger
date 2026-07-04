/** Formats naira amounts with the ₦ symbol. */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Formats amounts with grouping only (no currency symbol). */
export function formatPlainAmount(amount: number): string {
  return amount.toLocaleString("en-NG");
}
