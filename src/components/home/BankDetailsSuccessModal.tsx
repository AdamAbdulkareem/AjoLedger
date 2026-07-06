import { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { useThemedStyles, type Theme } from "../../theme";

const AUTO_DISMISS_MS = 2500;

type BankDetailsSuccessModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function BankDetailsSuccessModal({
  visible,
  onDismiss,
}: BankDetailsSuccessModalProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel={t("home.bankDetailsSuccess.dismiss")}
          onPress={onDismiss}
        />
        <View
          style={styles.card}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t("home.bankDetailsSuccess.title")}</Text>
            <Text style={styles.message}>
              {t("home.bankDetailsSuccess.message")}
            </Text>
          </View>
          <Button
            label={t("home.bankDetailsSuccess.ok")}
            onPress={onDismiss}
            size="compact"
            style={styles.okButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 29,
      paddingTop: 37,
      paddingBottom: theme.spacing.lg,
      gap: 36,
    },
    header: {
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    message: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 10,
      lineHeight: 14,
      color: theme.colors.textMuted,
      textAlign: "center",
      maxWidth: 211,
    },
    okButton: {
      backgroundColor: theme.colors.brand,
    },
  });
