import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  isTransactionPinAlreadyExistsError,
  setupTransactionPin,
} from "../../api/auth";
import { ApiError } from "../../api/client";
import { PasscodeOtpInput } from "../../components/AccessPasscodeInput";
import { Button } from "../../components/Button";
import { FormSubmittingIndicator } from "../../components/FormSubmittingIndicator";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { useAuth } from "../../context/AuthProvider";
import { invalidateUserQueries } from "../../lib/invalidateQueries";
import { setPendingOpenBankModal } from "../../lib/pendingBankModal";
import {
  isValidTransactionPin,
  normalizeTransactionPin,
  TRANSACTION_PIN_LENGTH,
} from "../../lib/transactionPin";
import { setTransactionPinConfigured } from "../../lib/transactionPinStorage";
import { waitForNextFrame } from "../../lib/waitForNextFrame";
import { useThemedStyles, type Theme } from "../../theme";

export default function SetupTransactionPinScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken, user } = useAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const isFormValid =
    isValidTransactionPin(pin) && isValidTransactionPin(confirmPin);

  const finishSetup = async () => {
    if (next === "bank") {
      setPendingOpenBankModal();
    }
    router.back();
  };

  const handleSave = async () => {
    setPinError(undefined);
    setConfirmError(undefined);
    setFormError(undefined);

    let valid = true;

    if (!isValidTransactionPin(pin)) {
      setPinError(t("auth.errors.pinLength"));
      valid = false;
    }

    if (!isValidTransactionPin(confirmPin)) {
      setConfirmError(t("auth.errors.pinLength"));
      valid = false;
    } else if (pin !== confirmPin) {
      setConfirmError(t("auth.errors.pinMismatch"));
      valid = false;
    }

    if (!valid || !accessToken || !user) return;

    setSubmitting(true);

    try {
      await waitForNextFrame();

      try {
        await setupTransactionPin(accessToken, { transactionPin: pin });
      } catch (error) {
        if (!isTransactionPinAlreadyExistsError(error)) {
          throw error;
        }
      }

      await setTransactionPinConfigured(user.id);
      await invalidateUserQueries(accessToken);
      await finishSetup();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : t("auth.errors.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("auth.createPinTitle")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("auth.createPinSubtitle")}</Text>

        <View style={styles.fields}>
          <PasscodeOtpInput
            label={t("auth.createPinTitle")}
            value={pin}
            onChangeText={setPin}
            error={pinError}
            editable={!submitting}
            autoFocus
            length={TRANSACTION_PIN_LENGTH}
            normalize={normalizeTransactionPin}
          />
          <PasscodeOtpInput
            label={t("auth.confirmPinLabel")}
            value={confirmPin}
            onChangeText={setConfirmPin}
            error={confirmError}
            editable={!submitting}
            length={TRANSACTION_PIN_LENGTH}
            normalize={normalizeTransactionPin}
          />
          <FormSubmittingIndicator
            message={t("auth.submittingPin")}
            visible={submitting}
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
          onPress={() => void handleSave()}
          disabled={!isFormValid}
          loading={submitting}
          size="compact"
        />
      </View>

      <HomeTabBar activeTab="profile" />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      gap: theme.spacing.lg,
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
