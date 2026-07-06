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

export default function SetupPinScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, setupPin } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string>();
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

  if (status === "needsPinEntry") {
    return <Redirect href="/enter-pin" />;
  }

  const validate = () => {
    let valid = true;
    setPinError(undefined);
    setConfirmError(undefined);
    setFormError(undefined);

    if (pin.length !== PIN_LENGTH) {
      setPinError(t("auth.errors.pinLength"));
      valid = false;
    }

    if (confirmPin.length !== PIN_LENGTH) {
      setConfirmError(t("auth.errors.pinLength"));
      valid = false;
    } else if (pin !== confirmPin) {
      setConfirmError(t("auth.errors.pinMismatch"));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setFormError(undefined);

    try {
      await setupPin(pin);
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
        <PinInput
          label={t("auth.createPinTitle")}
          helperText={t("auth.createPinSubtitle")}
          value={pin}
          onChangeText={setPin}
          error={pinError}
        />
        <PinInput
          label={t("auth.confirmPinLabel")}
          value={confirmPin}
          onChangeText={setConfirmPin}
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
          loading={submitting}
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
