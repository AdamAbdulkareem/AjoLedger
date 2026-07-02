import { resolveLanguageCode, type LanguageCode } from "../i18n/languages";

const DATE_LOCALES: Record<LanguageCode, string> = {
  en: "en-NG",
  yo: "yo-NG",
  ha: "ha-NG",
  ig: "ig-NG",
  pcm: "en-NG",
};

export function getDateLocale(language: string): string {
  const code = resolveLanguageCode(language);
  return DATE_LOCALES[code];
}
