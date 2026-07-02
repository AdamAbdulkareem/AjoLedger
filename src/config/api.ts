/** Set EXPO_PUBLIC_API_URL in .env to your backend base URL (no trailing slash). */
const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

/** When true, auth calls use local mocks instead of the backend. */
export const USE_MOCK_AUTH =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true";
