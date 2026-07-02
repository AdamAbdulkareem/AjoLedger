import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { setStoredLanguage } from "../i18n/languageStorage";
import {
  resolveLanguageCode,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "../i18n/languages";
import { useThemedStyles, type Theme } from "../theme";

export function LanguagePicker() {
  const { i18n, t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const activeLanguage = resolveLanguageCode(i18n.language);

  const handleSelect = async (code: LanguageCode) => {
    await setStoredLanguage(code);
    await i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("language.label")}</Text>
      <View style={styles.options}>
        {SUPPORTED_LANGUAGES.map((language) => {
          const isActive = activeLanguage === language.code;

          return (
            <Pressable
              key={language.code}
              onPress={() => handleSelect(language.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={language.label}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {language.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    label: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.colors.dotInactive,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    chipActive: {
      backgroundColor: theme.colors.brand,
      borderColor: theme.colors.brand,
    },
    chipText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    chipTextActive: {
      color: theme.colors.textPrimary,
    },
  });
