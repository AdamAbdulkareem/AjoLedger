/** Set EXPO_PUBLIC_API_URL in .env to your backend base URL (no trailing slash). */
const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

/** Clears legacy demo sessions created before production-only API mode. */
export function isLegacyMockAccessToken(
  token: string | null | undefined,
): boolean {
  return typeof token === "string" && token.startsWith("mock.");
}
