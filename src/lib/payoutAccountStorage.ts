import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { PayoutAccount } from "../models/payoutAccount";

function payoutAccountKey(userId: string) {
  return `payout_account_${userId}`;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredPayoutAccount(
  userId: string,
): Promise<PayoutAccount | null> {
  try {
    const raw = await getSecureItem(payoutAccountKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as PayoutAccount;
  } catch {
    return null;
  }
}

export async function setStoredPayoutAccount(
  userId: string,
  account: PayoutAccount,
): Promise<void> {
  try {
    await setSecureItem(payoutAccountKey(userId), JSON.stringify(account));
  } catch {
    // Storage unavailable — skip silently.
  }
}

export async function clearStoredPayoutAccount(userId: string): Promise<void> {
  try {
    await deleteSecureItem(payoutAccountKey(userId));
  } catch {
    // Storage unavailable — skip silently.
  }
}
