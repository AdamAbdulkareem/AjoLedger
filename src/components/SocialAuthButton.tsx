import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useThemedStyles, type Theme } from "../theme";

type SocialProvider = "google" | "apple";

type SocialAuthButtonProps = {
  provider: SocialProvider;
};

export function SocialAuthButton({ provider }: SocialAuthButtonProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const label =
    provider === "google"
      ? t("auth.continueWithGoogle")
      : t("auth.continueWithApple");

  const handlePress = () => {
    Alert.alert(t("auth.socialComingSoonTitle"), t("auth.socialComingSoonBody"));
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t("auth.socialComingSoonBody")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={provider === "google" ? "logo-google" : "logo-apple"}
        size={provider === "google" ? 20 : 22}
        color={styles.icon.color}
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      height: 48,
      borderRadius: theme.radius.button,
      borderWidth: 0.5,
      borderColor: theme.colors.textMuted,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: theme.spacing.lg,
    },
    pressed: {
      opacity: 0.85,
    },
    icon: {
      color: theme.colors.textPrimary,
    },
    label: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    },
  });
