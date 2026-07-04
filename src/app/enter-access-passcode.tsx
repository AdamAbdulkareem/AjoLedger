import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccessPasscodeInput } from "../components/AccessPasscodeInput";
import { ACCESS_PASSCODE_LENGTH } from "../lib/accessPasscodeStorage";
import { Button } from "../components/Button";
import { AjoLedgerLogo } from "../components/AjoLedgerLogo";
import { useAuth } from "../context/AuthProvider";
import { ApiError } from "../api/client";
import { INCORRECT_ACCESS_PASSCODE } from "../models/auth";
import { useThemedStyles, type Theme } from "../theme";

export default function EnterAccessPasscodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, verifyAccessPasscode, logout } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setPasscodeError(undefined);
    setFormError(undefined);

    if (passcode.length !== ACCESS_PASSCODE_LENGTH) {
      setPasscodeError(t("auth.errors.accessPasscodeLength"));
      return;
    }

    setSubmitting(true);

    try {
      await verifyAccessPasscode(passcode);
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

  const handleUseAnotherAccount = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <AjoLedgerLogo style={styles.logo} />
      <View style={styles.content}>
        <AccessPasscodeInput
          label={t("auth.enterAccessPasscodeTitle")}
          helperText={t("auth.enterAccessPasscodeSubtitle")}
          value={passcode}
          onChangeText={setPasscode}
          error={passcodeError}
        />
        {formError ? (
          <Text style={styles.formError} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}
        <Button
          label={t("auth.continue")}
          onPress={handleSubmit}
          disabled={submitting}
        />
        <Button
          label={t("auth.useAnotherAccount")}
          onPress={handleUseAnotherAccount}
          variant="secondary"
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
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    logo: {
      marginTop: theme.spacing.sm,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      gap: theme.spacing.lg,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
