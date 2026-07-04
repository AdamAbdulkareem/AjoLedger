import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { User } from "../models/auth";

const ACCESS_TOKEN_KEY = "auth_access_token";
const USER_KEY = "auth_user";

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

export async function getAccessToken(): Promise<string | null> {
  try {
    return await getSecureItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  try {
    await setSecureItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Storage unavailable — session won't persist but app still works.
  }
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await getSecureItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: User): Promise<void> {
  try {
    await setSecureItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable — skip silently.
  }
}

export async function clearSessionStorage(): Promise<void> {
  try {
    await Promise.all([
      deleteSecureItem(ACCESS_TOKEN_KEY),
      deleteSecureItem(USER_KEY),
    ]);
  } catch {
    // Storage unavailable — skip silently.
  }
}
