import { ActivityIndicator, Alert, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { isGoogleSignInConfigured, canUseGoogleSignIn } from "../lib/googleSignIn";
import { useThemedStyles, type Theme } from "../theme";

type SocialProvider = "google" | "apple";

type SocialAuthButtonProps = {
  provider: SocialProvider;
  onGooglePress?: () => void;
  googleLoading?: boolean;
  disabled?: boolean;
};

export function SocialAuthButton({
  provider,
  onGooglePress,
  googleLoading = false,
  disabled = false,
}: SocialAuthButtonProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const label =
    provider === "google"
      ? t("auth.continueWithGoogle")
      : t("auth.continueWithApple");

  const handlePress = () => {
    if (provider === "google") {
      if (!isGoogleSignInConfigured()) {
        Alert.alert(
          t("auth.socialComingSoonTitle"),
          t("auth.errors.googleNotConfigured"),
        );
        return;
      }

      if (!canUseGoogleSignIn()) {
        Alert.alert(
          t("auth.socialComingSoonTitle"),
          t("auth.errors.googleRequiresDevBuild"),
        );
        return;
      }

      onGooglePress?.();
      return;
    }

    Alert.alert(t("auth.socialComingSoonTitle"), t("auth.socialComingSoonBody"));
  };

  const isDisabled =
    disabled || (provider === "google" && googleLoading);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: googleLoading }}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {provider === "google" && googleLoading ? (
        <ActivityIndicator size="small" color={styles.icon.color} />
      ) : (
        <Ionicons
          name={provider === "google" ? "logo-google" : "logo-apple"}
          size={provider === "google" ? 20 : 22}
          color={styles.icon.color}
        />
      )}
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
    buttonDisabled: {
      opacity: 0.7,
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
