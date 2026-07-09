/**
 * Push notification scaffold for future backend integration.
 * Wire up expo-notifications when Sherif ships device token + event endpoints.
 */
export type PushRegistrationStatus = "unsupported" | "skipped" | "registered";

export async function registerForPushNotifications(): Promise<PushRegistrationStatus> {
  if (__DEV__) {
    return "skipped";
  }

  // Future: request permissions, get Expo push token, POST to backend.
  return "unsupported";
}

export function handleIncomingPushNotification(_payload: unknown): void {
  // Future: route payment/contribution events into TanStack Query invalidations.
}
