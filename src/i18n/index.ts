import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resolveInitialLanguage } from "./languageStorage";
import en from "./locales/en.json";
import ha from "./locales/ha.json";
import ig from "./locales/ig.json";
import pcm from "./locales/pcm.json";
import yo from "./locales/yo.json";
import { DEFAULT_LANGUAGE } from "./languages";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    yo: { translation: yo },
    ha: { translation: ha },
    ig: { translation: ig },
    pcm: { translation: pcm },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export async function initI18n(): Promise<void> {
  const language = await resolveInitialLanguage();
  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }
}

export { i18n };
