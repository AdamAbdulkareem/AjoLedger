import { ActionSheetIOS, Alert, Platform } from "react-native";
import type { TFunction } from "i18next";

import {
  resolveLanguageCode,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "../i18n/languages";

type ShowLanguagePickerOptions = {
  t: TFunction;
  currentLanguage: string;
  onSelect: (code: LanguageCode) => void;
};

export function showLanguagePicker({
  t,
  currentLanguage,
  onSelect,
}: ShowLanguagePickerOptions): void {
  const activeCode = resolveLanguageCode(currentLanguage);
  const labels = SUPPORTED_LANGUAGES.map((language) => language.label);
  const cancelLabel = t("language.cancel");

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: t("language.label"),
        options: [...labels, cancelLabel],
        cancelButtonIndex: labels.length,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex >= labels.length) return;
        onSelect(SUPPORTED_LANGUAGES[buttonIndex].code);
      },
    );
    return;
  }

  Alert.alert(
    t("language.label"),
    undefined,
    [
      ...SUPPORTED_LANGUAGES.map((language) => ({
        text:
          language.code === activeCode
            ? `${language.label} ✓`
            : language.label,
        onPress: () => onSelect(language.code),
      })),
      { text: cancelLabel, style: "cancel" as const },
    ],
    { cancelable: true },
  );
}
