import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "./secureStorage";

const TRANSACTION_PIN_CONFIGURED_PREFIX = "auth_transaction_pin_configured_";

function configuredKey(userId: string) {
  return `${TRANSACTION_PIN_CONFIGURED_PREFIX}${userId}`;
}

export async function hasStoredTransactionPinConfigured(
  userId: string,
): Promise<boolean> {
  try {
    const value = await getSecureItem(configuredKey(userId));
    return value === "1";
  } catch {
    return false;
  }
}

export async function setTransactionPinConfigured(
  userId: string,
): Promise<void> {
  try {
    await setSecureItem(configuredKey(userId), "1");
  } catch {
    // Storage unavailable — skip silently.
  }
}

export async function clearTransactionPinConfigured(
  userId: string,
): Promise<void> {
  try {
    await deleteSecureItem(configuredKey(userId));
  } catch {
    // Storage unavailable — skip silently.
  }
}

/** Prefer API flag when present; fall back to local setup marker. */
export async function resolveHasTransactionPin(
  userId: string,
  apiHasTransactionPin?: boolean | null,
): Promise<boolean> {
  if (apiHasTransactionPin === true) {
    void setTransactionPinConfigured(userId);
    return true;
  }

  if (apiHasTransactionPin === false) {
    return false;
  }

  return hasStoredTransactionPinConfigured(userId);
}
