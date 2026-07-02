/** Set EXPO_PUBLIC_API_URL in .env to your backend base URL (no trailing slash). */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/** When true, auth calls use local mocks instead of the backend. */
export const USE_MOCK_AUTH =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true";
