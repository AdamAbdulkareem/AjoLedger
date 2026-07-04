/** Set EXPO_PUBLIC_API_URL in .env to your backend base URL (no trailing slash). */
const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

/**
 * When true, all API modules except register/login use local mocks.
 */
export const USE_MOCK_AUTH =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true";

/**
 * When true, POST /auth/register and POST /auth/login hit the live backend.
 * Other endpoints continue to use mocks while USE_MOCK_AUTH is true.
 */
export const USE_LIVE_AUTH =
  process.env.EXPO_PUBLIC_USE_LIVE_AUTH === "true";

/** @deprecated Use USE_MOCK_AUTH — kept for readability in API modules. */
export const USE_MOCK_API = USE_MOCK_AUTH;

export function isMockAccessToken(token: string | null | undefined): boolean {
  return typeof token === "string" && token.startsWith("mock.");
}

export function shouldUseLiveRegisterLogin(): boolean {
  return USE_LIVE_AUTH || !USE_MOCK_AUTH;
}
