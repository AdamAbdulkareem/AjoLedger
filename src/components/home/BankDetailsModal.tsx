import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { getBanks, resolveAccount } from "../../api/banks";
import { ApiError } from "../../api/client";
import { Button } from "../Button";
import { TextField } from "../TextField";
import {
  isValidNuban,
  normalizeAccountNumber,
} from "../../lib/payoutAccountValidation";
import { findBankByCode, showBankPicker } from "../../lib/showBankPicker";
import type { Bank } from "../../models/bank";
import type { PayoutAccount, SetupBankPayload } from "../../models/payoutAccount";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type ResolveState = "idle" | "loading" | "success" | "error";

type BankDetailsModalProps = {
  visible: boolean;
  accessToken: string | null;
  saving: boolean;
  error?: string | null;
  onSubmit: (
    payload: SetupBankPayload,
    bankName: string,
  ) => Promise<"success" | "failed" | "already_configured">;
  onClearError?: () => void;
  /** When true, the user can dismiss the modal (e.g. from Profile settings). */
  dismissible?: boolean;
  onClose?: () => void;
  initialAccount?: PayoutAccount | null;
  /** Profile edits require transaction PIN — not supported yet. */
  variant?: "onboarding" | "profile";
  onAlreadyConfigured?: () => void;
  /** Onboarding only — dismiss without saving bank details. */
  onSkip?: () => void;
};

export function BankDetailsModal({
  visible,
  accessToken,
  saving,
  error,
  onSubmit,
  onClearError,
  dismissible = false,
  onClose,
  initialAccount,
  variant = "onboarding",
  onAlreadyConfigured,
  onSkip,
}: BankDetailsModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState<string>();

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankError, setBankError] = useState<string>();
  const [accountError, setAccountError] = useState<string>();

  const [resolveState, setResolveState] = useState<ResolveState>("idle");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolveRequestIdRef = useRef(0);

  const isProfileVariant = variant === "profile";
  const canResolve =
    !isProfileVariant &&
    !!accessToken &&
    !!selectedBank &&
    isValidNuban(normalizeAccountNumber(accountNumber));

  const canSubmit =
    variant === "onboarding" &&
    canResolve &&
    resolveState === "success" &&
    !!resolvedName;

  useEffect(() => {
    if (!visible || !accessToken) return;

    let cancelled = false;
    setBanksLoading(true);
    setBanksError(undefined);

    void getBanks(accessToken)
      .then((list) => {
        if (cancelled) return;
        setBanks(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setBanksError(
          err instanceof ApiError
            ? err.message
            : t("home.bankDetails.errors.banksLoadFailed"),
        );
      })
      .finally(() => {
        if (!cancelled) setBanksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, accessToken, t]);

  useEffect(() => {
    if (visible) return;
    setIsSubmitting(false);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (initialAccount) {
      setAccountNumber(initialAccount.accountNumber);
      setResolvedName(initialAccount.accountName ?? null);
      setResolveState(initialAccount.accountName ? "success" : "idle");
    } else {
      setSelectedBank(null);
      setAccountNumber("");
      setResolvedName(null);
      setResolveState("idle");
    }
    setBankError(undefined);
    setAccountError(undefined);
    setResolveError(undefined);
    onClearError?.();
  }, [visible, initialAccount, onClearError]);

  useEffect(() => {
    if (!visible || !initialAccount) return;

    const bank =
      (banks.length > 0
        ? findBankByCode(banks, initialAccount.bankCode)
        : null) ??
      ({
        bankCode: initialAccount.bankCode,
        bankName: initialAccount.bankName,
      } satisfies Bank);
    setSelectedBank(bank);
  }, [visible, initialAccount, banks]);

  useEffect(() => {
    if (isProfileVariant) return;

    if (!visible || !canResolve || !accessToken || !selectedBank) {
      if (!canResolve) {
        setResolveState("idle");
        setResolvedName(null);
        setResolveError(undefined);
      }
      return;
    }

    const requestId = ++resolveRequestIdRef.current;
    const normalized = normalizeAccountNumber(accountNumber);

    setResolveState("loading");
    setResolvedName(null);
    setResolveError(undefined);
    setAccountError(undefined);

    void resolveAccount(accessToken, {
      bankCode: selectedBank.bankCode,
      accountNumber: normalized,
    })
      .then((result) => {
        if (requestId !== resolveRequestIdRef.current) return;
        setResolvedName(result.accountName);
        setResolveState("success");
      })
      .catch((err) => {
        if (requestId !== resolveRequestIdRef.current) return;
        const message =
          err instanceof ApiError
            ? err.message
            : t("home.bankDetails.errors.resolveFailed");
        setResolveError(message);
        setResolveState("error");
      });

    return () => {
      resolveRequestIdRef.current += 1;
    };
  }, [
    visible,
    accessToken,
    selectedBank,
    accountNumber,
    canResolve,
    isProfileVariant,
    t,
  ]);

  const resetResolveState = () => {
    resolveRequestIdRef.current += 1;
    setResolveState("idle");
    setResolvedName(null);
    setResolveError(undefined);
  };

  const handleClose = () => {
    if (dismissible) onClose?.();
  };

  const handleBankPress = () => {
    if (isProfileVariant || banksLoading || banks.length === 0) return;

    showBankPicker({
      t,
      banks,
      selectedBankCode: selectedBank?.bankCode,
      onSelect: (bank) => {
        setSelectedBank(bank);
        setBankError(undefined);
        resetResolveState();
      },
    });
  };

  const handleAccountChange = (text: string) => {
    if (isProfileVariant) return;
    setAccountNumber(normalizeAccountNumber(text));
    setAccountError(undefined);
    resetResolveState();
  };

  const handleSubmit = async () => {
    if (isProfileVariant) return;

    setBankError(undefined);
    setAccountError(undefined);
    onClearError?.();

    if (!selectedBank) {
      setBankError(t("home.bankDetails.errors.bankRequired"));
      return;
    }

    const normalized = normalizeAccountNumber(accountNumber);
    if (!isValidNuban(normalized)) {
      setAccountError(t("home.bankDetails.errors.accountInvalid"));
      return;
    }

    if (resolveState !== "success" || !resolvedName) {
      setAccountError(t("home.bankDetails.errors.resolveRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(
        {
          bankCode: selectedBank.bankCode,
          accountNumber: normalized,
          accountName: resolvedName,
        },
        selectedBank.bankName,
      );

      if (result === "already_configured") {
        onAlreadyConfigured?.();
      }

      if (result === "success" && dismissible) {
        onClose?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.bankDetails.title")}</Text>
        <Text style={styles.subtitle}>{t("home.bankDetails.subtitle")}</Text>
      </View>

      {banksLoading ? (
        <View style={styles.inlineStatus}>
          <ActivityIndicator size="small" color={theme.colors.brand} />
          <Text style={styles.inlineStatusText}>
            {t("home.bankDetails.loadingBanks")}
          </Text>
        </View>
      ) : null}

      {banksError ? (
        <Text style={styles.formError}>{banksError}</Text>
      ) : null}

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{t("home.bankDetails.bankLabel")}</Text>
        <Pressable
          onPress={handleBankPress}
          disabled={isProfileVariant || banksLoading || banks.length === 0}
          accessibilityRole="button"
          accessibilityLabel={t("home.bankDetails.bankLabel")}
          style={({ pressed }) => [
            styles.bankRow,
            bankError && styles.fieldError,
            pressed && !isProfileVariant && styles.pressed,
            (isProfileVariant || banksLoading || banks.length === 0) &&
              styles.disabled,
          ]}
        >
          <Text
            style={[
              styles.bankValue,
              !selectedBank && styles.bankPlaceholder,
            ]}
          >
            {selectedBank?.bankName ?? t("home.bankDetails.bankPlaceholder")}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textPrimary} />
        </Pressable>
        {bankError ? <Text style={styles.errorText}>{bankError}</Text> : null}
      </View>

      <TextField
        label={t("home.bankDetails.accountLabel")}
        value={accountNumber}
        onChangeText={handleAccountChange}
        placeholder={t("home.bankDetails.accountPlaceholder")}
        error={accountError}
        keyboardType="number-pad"
        autoComplete="off"
        textContentType="none"
        editable={!isProfileVariant}
      />

      {!isProfileVariant && resolveState === "loading" ? (
        <View style={styles.inlineStatus}>
          <ActivityIndicator size="small" color={theme.colors.brand} />
          <Text style={styles.inlineStatusText}>
            {t("home.bankDetails.resolving")}
          </Text>
        </View>
      ) : null}

      {!isProfileVariant && resolveState === "success" && resolvedName ? (
        <View style={styles.resolveSuccess} accessibilityLiveRegion="polite">
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.resolveSuccessText}>{resolvedName}</Text>
        </View>
      ) : null}

      {!isProfileVariant && resolveState === "error" && resolveError ? (
        <View style={styles.resolveError} accessibilityLiveRegion="polite">
          <Ionicons
            name="close-circle"
            size={18}
            color={theme.colors.error}
          />
          <Text style={styles.resolveErrorText}>{resolveError}</Text>
        </View>
      ) : null}

      {isProfileVariant ? (
        <Text style={styles.profileHint}>{t("home.bankDetails.profileHint")}</Text>
      ) : null}

      {error ? <Text style={styles.formError}>{error}</Text> : null}

      {!isProfileVariant ? (
        <Button
          label={t("home.bankDetails.next")}
          onPress={() => void handleSubmit()}
          disabled={!canSubmit || isSubmitting}
          loading={saving || isSubmitting}
          size="compact"
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.activityPayoutBg },
          ]}
        />
      ) : null}

      {!isProfileVariant && onSkip ? (
        <Button
          label={t("home.bankDetails.skip")}
          onPress={onSkip}
          variant="secondary"
          disabled={saving || isSubmitting}
        />
      ) : null}

      {dismissible ? (
        <Button
          label={t("home.bankDetails.cancel")}
          onPress={handleClose}
          variant="secondary"
          disabled={saving}
        />
      ) : null}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? handleClose : undefined}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {dismissible ? (
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable
              style={styles.card}
              onPress={(event) => event.stopPropagation()}
            >
              {form}
            </Pressable>
          </Pressable>
        ) : (
          <View style={styles.overlay}>
            <View style={styles.card}>{form}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    keyboardAvoid: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(223, 227, 233, 0.7)",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      maxHeight: "90%",
    },
    formContent: {
      gap: theme.spacing.md,
    },
    header: {
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    fieldGroup: {
      gap: theme.spacing.sm,
    },
    fieldLabel: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    bankRow: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    fieldError: {
      borderColor: theme.colors.errorBorder,
    },
    disabled: {
      opacity: 0.6,
    },
    bankValue: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    bankPlaceholder: {
      color: theme.colors.textMuted,
    },
    pressed: {
      opacity: 0.85,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    inlineStatus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    inlineStatusText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    resolveSuccess: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    resolveSuccessText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.successDark,
      flex: 1,
    },
    resolveError: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    resolveErrorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      flex: 1,
    },
    profileHint: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    submitButton: {
      marginTop: theme.spacing.xs,
    },
  });
