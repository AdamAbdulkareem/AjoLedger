import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { TextField } from "../TextField";
import { isValidTransactionPin, normalizeTransactionPin } from "../../lib/transactionPin";
import { useThemedStyles, type Theme } from "../../theme";

type PayoutPinModalProps = {
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (pin: string) => void;
};

export function PayoutPinModal({
  visible,
  loading = false,
  error,
  onClose,
  onSubmit,
}: PayoutPinModalProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!visible) {
      setPin("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!isValidTransactionPin(pin)) {
      return;
    }

    onSubmit(pin);
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.title}>{t("groups.payout.pinTitle")}</Text>
            <Text style={styles.body}>{t("groups.payout.pinBody")}</Text>

            <TextField
              label={t("groups.payout.pinLabel")}
              value={pin}
              onChangeText={(value) => setPin(normalizeTransactionPin(value))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={error ?? undefined}
              editable={!loading}
              autoFocus
            />

            <View style={styles.actions}>
              <Button
                label={t("groups.payout.pinCancel")}
                onPress={handleClose}
                variant="secondary"
                disabled={loading}
                style={styles.actionButton}
              />
              <Button
                label={t("groups.payout.pinConfirm")}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !isValidTransactionPin(pin)}
                style={styles.actionButton}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    keyboardWrap: {
      width: "100%",
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
