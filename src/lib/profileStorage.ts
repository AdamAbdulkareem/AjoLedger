import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { UserProfile } from "../models/profile";

function profileKey(userId: string) {
  return `user_profile_${userId}`;
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function getStoredProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const raw = await getItem(profileKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function setStoredProfile(
  userId: string,
  profile: UserProfile,
): Promise<void> {
  try {
    await setItem(profileKey(userId), JSON.stringify(profile));
  } catch {
    // Storage unavailable — skip silently.
  }
}
