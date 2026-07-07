import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRICS_ENABLED_PREFIX = "auth_biometrics_enabled_";

function biometricsKey(userId: string) {
  return `${BIOMETRICS_ENABLED_PREFIX}${userId}`;
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
): Promise<void> {
  try {
    if (enabled) {
      await setSecureItem(biometricsKey(userId), "true");
    } else {
      await deleteSecureItem(biometricsKey(userId));
    }
  } catch {
    // Storage unavailable — preference won't persist.
  }
}

export async function clearBiometricsEnabled(userId: string): Promise<void> {
  try {
    await deleteSecureItem(biometricsKey(userId));
  } catch {
    // Storage unavailable — skip silently.
  }
}
