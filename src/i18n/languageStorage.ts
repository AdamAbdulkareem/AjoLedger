import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

import {
  DEFAULT_LANGUAGE,
  isLanguageCode,
  type LanguageCode,
} from "./languages";

const LANGUAGE_KEY = "preferred_language";

export async function getStoredLanguage(): Promise<LanguageCode | null> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (value && isLanguageCode(value)) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setStoredLanguage(language: LanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage unavailable — language still changes for this session via i18n.
  }
}

export async function resolveInitialLanguage(): Promise<LanguageCode> {
  const stored = await getStoredLanguage();
  if (stored) {
    return stored;
  }

  const deviceLanguage = getLocales()[0]?.languageCode;
  if (deviceLanguage && isLanguageCode(deviceLanguage)) {
    return deviceLanguage;
  }

  return DEFAULT_LANGUAGE;
}
