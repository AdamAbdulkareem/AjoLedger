import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "./secureStorage";

const BIOMETRICS_ENABLED_PREFIX = "auth_biometrics_enabled_";

function biometricsKey(userId: string) {
  return `${BIOMETRICS_ENABLED_PREFIX}${userId}`;
}

export async function isBiometricsEnabled(userId: string): Promise<boolean> {
  try {
    const value = await getSecureItem(biometricsKey(userId));
    return value === "true";
  } catch {
    return false;
  }
}

export async function setBiometricsEnabled(
  userId: string,
  enabled: boolean,
): Promise<boolean> {
  try {
    if (enabled) {
      await setSecureItem(biometricsKey(userId), "true");
    } else {
      await deleteSecureItem(biometricsKey(userId));
    }
    return true;
  } catch {
    return false;
  }
}

export async function clearBiometricsEnabled(userId: string): Promise<void> {
  try {
    await deleteSecureItem(biometricsKey(userId));
  } catch {
    // Storage unavailable — skip silently.
  }
}
