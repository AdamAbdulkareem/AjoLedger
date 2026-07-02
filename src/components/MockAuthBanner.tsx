import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { USE_MOCK_AUTH } from "../config/api";
import { useThemedStyles, type Theme } from "../theme";

export function MockAuthBanner() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  if (!USE_MOCK_AUTH) return null;

  return (
    <Text style={styles.banner} accessibilityRole="text">
      {t("auth.mockModeHint")}
    </Text>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    banner: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: "center",
      backgroundColor: theme.colors.dotInactive,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.button,
    },
  });
