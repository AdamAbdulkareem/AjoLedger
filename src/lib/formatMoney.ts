/** Formats naira amounts with the ₦ symbol (screen 2 design). */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
