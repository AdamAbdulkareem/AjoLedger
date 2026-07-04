import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ACCESS_PASSCODE_LENGTH,
  AccessPasscodeInput,
} from "../components/AccessPasscodeInput";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthProvider";
import { ApiError } from "../api/client";
import { useThemedStyles, type Theme } from "../theme";

export default function SetupAccessPasscodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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
      <View style={styles.content}>
        <AccessPasscodeInput
          label={t("auth.createAccessPasscodeTitle")}
          helperText={t("auth.createAccessPasscodeSubtitle")}
          value={passcode}
          onChangeText={setPasscode}
          error={passcodeError}
        />
        <AccessPasscodeInput
          label={t("auth.confirmAccessPasscodeLabel")}
          value={confirmPasscode}
          onChangeText={setConfirmPasscode}
          error={confirmError}
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
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      justifyContent: "center",
    },
    content: {
      gap: theme.spacing.lg,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
