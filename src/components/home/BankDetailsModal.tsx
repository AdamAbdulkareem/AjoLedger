import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { TextField } from "../TextField";
import { normalizeAccountNumber } from "../../lib/payoutAccountValidation";
import { showBankPicker } from "../../lib/showBankPicker";
import {
  findBankByCode,
  type NigerianBank,
} from "../../lib/nigerianBanks";
import type {
  PayoutAccount,
  SavePayoutAccountPayload,
} from "../../models/payoutAccount";
import { useThemedStyles, type Theme } from "../../theme";

type BankDetailsModalProps = {
  visible: boolean;
  saving: boolean;
  error?: string | null;
  onSubmit: (payload: SavePayoutAccountPayload) => Promise<boolean>;
  /** When true, the user can dismiss the modal (e.g. from Profile settings). */
  dismissible?: boolean;
  onClose?: () => void;
  initialAccount?: PayoutAccount | null;
};

export function BankDetailsModal({
  visible,
  saving,
  error,
  onSubmit,
  dismissible = false,
  onClose,
  initialAccount,
}: BankDetailsModalProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const [selectedBank, setSelectedBank] = useState<NigerianBank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankError, setBankError] = useState<string>();
  const [accountError, setAccountError] = useState<string>();

  useEffect(() => {
    if (!visible) return;

    if (initialAccount) {
      setSelectedBank(findBankByCode(initialAccount.bankCode) ?? {
        code: initialAccount.bankCode,
        name: initialAccount.bankName,
      });
      setAccountNumber(initialAccount.accountNumber);
    } else {
      setSelectedBank(null);
      setAccountNumber("");
    }
    setBankError(undefined);
    setAccountError(undefined);
  }, [visible, initialAccount]);

  const handleClose = () => {
    if (dismissible) onClose?.();
  };

  const handleBankPress = () => {
    showBankPicker({
      t,
      selectedBankCode: selectedBank?.code,
      onSelect: (bank) => {
        setSelectedBank(bank);
        setBankError(undefined);
      },
    });
  };

  const handleSubmit = async () => {
    let valid = true;
    setBankError(undefined);
    setAccountError(undefined);

    if (!selectedBank) {
      setBankError(t("home.bankDetails.errors.bankRequired"));
      valid = false;
    }

    const normalized = normalizeAccountNumber(accountNumber);
    if (!/^\d{10}$/.test(normalized)) {
      setAccountError(t("home.bankDetails.errors.accountInvalid"));
      valid = false;
    }

    if (!valid || !selectedBank) return;

    const saved = await onSubmit({
      bankCode: selectedBank.code,
      bankName: selectedBank.name,
      accountNumber: normalized,
    });

    if (saved && dismissible) {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? handleClose : undefined}
    >
      {dismissible ? (
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            {renderForm()}
          </Pressable>
        </Pressable>
      ) : (
        <View style={styles.overlay}>
          <View style={styles.card}>{renderForm()}</View>
        </View>
      )}
    </Modal>
  );

  function renderForm() {
    return (
      <>
          <View style={styles.header}>
            <Text style={styles.title}>{t("home.bankDetails.title")}</Text>
            <Text style={styles.subtitle}>{t("home.bankDetails.subtitle")}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("home.bankDetails.bankLabel")}</Text>
            <Pressable
              onPress={handleBankPress}
              accessibilityRole="button"
              accessibilityLabel={t("home.bankDetails.bankLabel")}
              style={({ pressed }) => [
                styles.bankRow,
                bankError && styles.fieldError,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.bankValue,
                  !selectedBank && styles.bankPlaceholder,
                ]}
              >
                {selectedBank?.name ?? t("home.bankDetails.bankPlaceholder")}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#2C3138" />
            </Pressable>
            {bankError ? <Text style={styles.errorText}>{bankError}</Text> : null}
          </View>

          <TextField
            label={t("home.bankDetails.accountLabel")}
            value={accountNumber}
            onChangeText={(text) => {
              setAccountNumber(normalizeAccountNumber(text));
              setAccountError(undefined);
            }}
            placeholder={t("home.bankDetails.accountPlaceholder")}
            error={accountError}
            keyboardType="number-pad"
            autoComplete="off"
            textContentType="none"
          />

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Button
            label={t("home.bankDetails.continue")}
            onPress={() => void handleSubmit()}
            disabled={saving}
            style={styles.submitButton}
          />

          {dismissible ? (
            <Button
              label={t("home.bankDetails.cancel")}
              onPress={handleClose}
              variant="secondary"
              disabled={saving}
            />
          ) : null}
      </>
    );
  }
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    submitButton: {
      marginTop: theme.spacing.xs,
    },
  });
