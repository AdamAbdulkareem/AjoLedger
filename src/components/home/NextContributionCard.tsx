import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { formatContributionDue } from "../../lib/homeSpeech";
import { formatNaira } from "../../lib/formatMoney";
import type { NextContribution } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type NextContributionCardProps = {
  contribution: NextContribution;
  onHowToPayPress?: () => void;
};

export function NextContributionCard({
  contribution,
  onHowToPayPress,
}: NextContributionCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.label}>{t("home.nextContribution")}</Text>
        <Text style={styles.amount}>{formatNaira(contribution.amount)}</Text>
        <Text style={styles.due}>
          {formatContributionDue(
            t,
            contribution.daysUntilDue,
            contribution.dueDate,
          )}
        </Text>
      </View>
      <Pressable
        onPress={onHowToPayPress}
        accessibilityRole="button"
        accessibilityLabel={t("home.howToPay")}
        style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
      >
        <Ionicons
          name="download-outline"
          size={16}
          color={theme.colors.successDark}
        />
        <Text style={styles.payLabel}>{t("home.howToPay")}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.card,
    },
    content: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    amount: {
      ...theme.typography.stat,
      color: theme.colors.successDark,
    },
    due: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    payButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.successMuted,
    },
    pressed: {
      opacity: 0.85,
    },
    payLabel: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
    },
  });
