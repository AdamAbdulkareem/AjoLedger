export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "pcm", label: "Pidgin" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((language) => language.code === value);
}

/** Maps i18n.language (e.g. "en-US") to a supported app language code. */
export function resolveLanguageCode(language: string): LanguageCode {
  if (isLanguageCode(language)) {
    return language;
  }

  const baseCode = language.split("-")[0];
  if (isLanguageCode(baseCode)) {
    return baseCode;
  }

  return DEFAULT_LANGUAGE;
}

export function getLanguageLabel(language: string): string {
  const code = resolveLanguageCode(language);
  return (
    SUPPORTED_LANGUAGES.find((entry) => entry.code === code)?.label ?? "English"
  );
}
