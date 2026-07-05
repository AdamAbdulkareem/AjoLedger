import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasscodeOtpInput } from "../components/AccessPasscodeInput";
import { ACCESS_PASSCODE_LENGTH } from "../lib/accessPasscodeStorage";
import { Button } from "../components/Button";
import { AjoLedgerLogo } from "../components/AjoLedgerLogo";
import { useAuth } from "../context/AuthProvider";
import { ApiError } from "../api/client";
import { useTheme, useThemedStyles, type Theme } from "../theme";

export default function SetupAccessPasscodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { status, setupAccessPasscode } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (status === "booting") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/register" />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(app)/home" />;
  }

  if (status === "needsPasscodeEntry") {
    return <Redirect href="/enter-access-passcode" />;
  }

  const canSubmit =
    passcode.length === ACCESS_PASSCODE_LENGTH &&
    confirmPasscode.length === ACCESS_PASSCODE_LENGTH &&
    !submitting;

  const validate = () => {
    let valid = true;
    setPasscodeError(undefined);
    setConfirmError(undefined);
    setFormError(undefined);

    if (passcode.length !== ACCESS_PASSCODE_LENGTH) {
      setPasscodeError(t("auth.errors.accessPasscodeLength"));
      valid = false;
    }

    if (confirmPasscode.length !== ACCESS_PASSCODE_LENGTH) {
      setConfirmError(t("auth.errors.accessPasscodeLength"));
      valid = false;
    } else if (passcode !== confirmPasscode) {
      setConfirmError(t("auth.errors.accessPasscodeMismatch"));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setFormError(undefined);

    try {
      await setupAccessPasscode(passcode);
      router.replace("/(app)/home");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t("auth.errors.generic");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AjoLedgerLogo style={styles.logo} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.createAccessPasscodeTitle")}</Text>
          <Text style={styles.subtitle}>
            {t("auth.createAccessPasscodeSubtitle")}
          </Text>
        </View>

        <View style={styles.fields}>
          <PasscodeOtpInput
            label={t("auth.inputPasscodeLabel")}
            value={passcode}
            onChangeText={setPasscode}
            error={passcodeError}
            autoFocus
          />
          <PasscodeOtpInput
            label={t("auth.confirmPasscodeFieldLabel")}
            value={confirmPasscode}
            onChangeText={setConfirmPasscode}
            error={confirmError}
          />
        </View>

        {formError ? (
          <Text style={styles.formError} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t("auth.continue")}
          onPress={handleSubmit}
          disabled={!canSubmit}
          size="compact"
          style={{ backgroundColor: theme.colors.activityPayoutBg }}
        />
      </View>
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
      paddingHorizontal: theme.spacing.md + 4,
      paddingTop: theme.spacing.xl + theme.spacing.sm,
      gap: theme.spacing.xl,
    },
    header: {
      gap: 6,
      alignItems: "center",
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    fields: {
      gap: theme.spacing.md,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
  });
