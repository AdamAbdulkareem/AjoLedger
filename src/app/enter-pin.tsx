import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import { PIN_LENGTH, PinInput } from "../components/PinInput";
import { useAuth } from "../context/AuthProvider";
import { ApiError } from "../api/client";
import { useThemedStyles, type Theme } from "../theme";

export default function EnterPinScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, verifyPin, logout } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (status === "booting") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  if (status === "needsPinSetup") {
    return <Redirect href="/setup-pin" />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(app)/home" />;
  }

  const handleSubmit = async () => {
    setPinError(undefined);
    setFormError(undefined);

    if (pin.length !== PIN_LENGTH) {
      setPinError(t("auth.errors.pinLength"));
      return;
    }

    setSubmitting(true);

    try {
      await verifyPin(pin);
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

  const handleUseAnotherAccount = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t("auth.errors.generic");
      setFormError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <PinInput
          label={t("auth.enterPinTitle")}
          helperText={t("auth.enterPinSubtitle")}
          value={pin}
          onChangeText={setPin}
          error={pinError}
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
