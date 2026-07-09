import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { formatAmountRemainsDue } from "../../lib/localizeActivity";
import { formatNaira } from "../../lib/formatMoney";
import type { AmountRemains } from "../../models/home";
import { useThemedStyles, type Theme } from "../../theme";

type AmountRemainsCardProps = {
  amountRemains: AmountRemains;
  onPayNowPress?: () => void;
};

export function AmountRemainsCard({
  amountRemains,
  onPayNowPress,
}: AmountRemainsCardProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="time-outline" size={14} color="#2C3138" />
        </View>
        <Text style={styles.headerLabel}>{t("home.amountRemains")}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.amountCol}>
          <Text style={styles.amount}>{formatNaira(amountRemains.amount)}</Text>
          <Text style={styles.due}>
            {formatAmountRemainsDue(
              t,
              amountRemains.daysUntilDue,
              amountRemains.dueDate,
            )}
          </Text>
        </View>

        <Pressable
          onPress={onPayNowPress}
          accessibilityRole="button"
          accessibilityLabel={t("home.payNow")}
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
        >
          <Text style={styles.payLabel}>{t("home.payNow")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      backgroundColor: theme.colors.carouselCardBg,
      paddingVertical: 5,
      gap: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 20,
    },
    headerIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      padding: 3,
    },
    headerLabel: {
      ...theme.typography.amountRemainsLabel,
      color: theme.colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    amountCol: {
      gap: 4,
      maxWidth: 140,
    },
    amount: {
      ...theme.typography.progressStat,
      color: theme.colors.amountDue,
    },
    due: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    payButton: {
      minWidth: 74,
      padding: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.85,
    },
    payLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
  });
