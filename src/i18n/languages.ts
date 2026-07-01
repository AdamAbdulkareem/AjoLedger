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
