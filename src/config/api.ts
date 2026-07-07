/** Set EXPO_PUBLIC_API_URL in .env to your backend base URL (no trailing slash). */
const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

/** Returns true when the token is a legacy mock/demo access token (mock.* prefix). */
export function isLegacyMockAccessToken(
  token: string | null | undefined,
): boolean {
  return typeof token === "string" && token.startsWith("mock.");
}
