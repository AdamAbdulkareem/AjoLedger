import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasscodeRowInput } from "../components/AccessPasscodeInput";
import { ACCESS_PASSCODE_LENGTH } from "../lib/accessPasscodeStorage";
import { Button } from "../components/Button";
import { AjoLedgerLogo } from "../components/AjoLedgerLogo";
import { PasscodeUserBadge } from "../components/PasscodeUserBadge";
import { useAuth } from "../context/AuthProvider";
import { useProfile } from "../context/ProfileProvider";
import { ApiError } from "../api/client";
import { INCORRECT_ACCESS_PASSCODE } from "../models/auth";
import { useTheme, useThemedStyles, type Theme } from "../theme";

export default function EnterAccessPasscodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { status, user, verifyAccessPasscode, resetAccessPasscode, logout } =
    useAuth();
  const { profile } = useProfile();
  const styles = useThemedStyles(createStyles);

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    passcode.length === ACCESS_PASSCODE_LENGTH && !submitting;

  const handleSubmit = async (code?: string) => {
    if (submitting) return;

    const value = code ?? passcode;
    setPasscodeError(undefined);
    setFormError(undefined);

    if (value.length !== ACCESS_PASSCODE_LENGTH) {
      setPasscodeError(t("auth.errors.accessPasscodeLength"));
      return;
    }

    setSubmitting(true);

    try {
      await verifyAccessPasscode(value);
      router.replace("/(app)/home");
    } catch (error) {
      const message =
        error instanceof ApiError &&
        error.message === INCORRECT_ACCESS_PASSCODE
          ? t("auth.errors.incorrectAccessPasscode")
          : error instanceof ApiError
            ? error.message
            : t("auth.errors.generic");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "booting") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  if (status === "needsPasscodeSetup") {
    return <Redirect href="/setup-access-passcode" />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(app)/home" />;
  }

  const handleForgetPasscode = () => {
    Alert.alert(
      t("auth.forgetPasscodeTitle"),
      t("auth.forgetPasscodeBody"),
      [
        { text: t("auth.forgetPasscodeCancel"), style: "cancel" },
        {
          text: t("auth.forgetPasscodeConfirm"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await resetAccessPasscode();
                router.replace("/setup-access-passcode");
              } catch (error) {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : t("auth.errors.generic");
                Alert.alert(t("auth.errors.generic"), message);
              }
            })();
          },
        },
      ],
    );
  };

  const handleSwitchAccount = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t("auth.errors.generic");
      Alert.alert(t("auth.errors.generic"), message);
    }
  };

  const handleFingerprint = () => {
    Alert.alert(
      t("auth.fingerprintComingSoonTitle"),
      t("auth.fingerprintComingSoonBody"),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AjoLedgerLogo style={styles.logo} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <PasscodeUserBadge
            email={user.email}
            avatarUri={profile?.avatarUri}
          />
        ) : null}

        <View style={styles.form}>
          <PasscodeRowInput
            placeholder={t("auth.enterPasscodePlaceholder")}
            value={passcode}
            onChangeText={setPasscode}
            error={passcodeError}
            onComplete={(code) => {
              void handleSubmit(code);
            }}
          />
          <Pressable
            onPress={handleForgetPasscode}
            accessibilityRole="button"
            accessibilityLabel={t("auth.forgetPasscode")}
            style={styles.forgetLinkWrap}
          >
            <Text style={styles.forgetLink}>{t("auth.forgetPasscode")}</Text>
          </Pressable>
        </View>

        {formError ? (
          <Text style={styles.formError} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}

        <Button
          label={t("auth.logIn")}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={!canSubmit}
          size="compact"
          style={{ backgroundColor: theme.colors.activityPayoutBg }}
        />

        <View style={styles.footerLinks}>
          <Pressable
            onPress={() => {
              void handleSwitchAccount();
            }}
            accessibilityRole="button"
            accessibilityLabel={t("auth.switchAccount")}
          >
            <Text style={styles.footerLink}>{t("auth.switchAccount")}</Text>
          </Pressable>
          <Text style={styles.footerDivider}>|</Text>
          <Pressable
            onPress={handleFingerprint}
            accessibilityRole="button"
            accessibilityLabel={t("auth.loginWithFingerprint")}
          >
            <Text style={styles.footerLink}>{t("auth.loginWithFingerprint")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    logo: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xl + theme.spacing.md,
      gap: theme.spacing.lg,
    },
    form: {
      gap: theme.spacing.sm + 3,
    },
    forgetLinkWrap: {
      alignSelf: "stretch",
    },
    forgetLink: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
      textAlign: "right",
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    footerLink: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
    },
    footerDivider: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
  });
