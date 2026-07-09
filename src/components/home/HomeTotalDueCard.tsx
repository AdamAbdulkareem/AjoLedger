import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatNaira } from "../../lib/formatMoney";
import { useThemedStyles, type Theme } from "../../theme";

type HomeTotalDueCardProps = {
  totalDue: number;
  onSettleAllPress: () => void;
};

export function HomeTotalDueCard({
  totalDue,
  onSettleAllPress,
}: HomeTotalDueCardProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  if (totalDue <= 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>
          {t("home.totalDueThisWeek")}
          <Text style={styles.amount}> {formatNaira(totalDue)}</Text>
        </Text>
        <Text style={styles.subtitle}>{t("home.totalDueSubtitle")}</Text>
      </View>

      <Pressable
        onPress={onSettleAllPress}
        accessibilityRole="button"
        accessibilityLabel={t("home.settleAll")}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>{t("home.settleAll")}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.carouselCardBg,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 20,
      alignItems: "center",
    },
    copy: {
      gap: 4,
      alignItems: "center",
    },
    title: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    amount: {
      color: theme.colors.amountDue,
    },
    subtitle: {
      ...theme.typography.micro,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    button: {
      width: "100%",
      backgroundColor: theme.colors.brand,
      borderRadius: 10,
      padding: 8,
      alignItems: "center",
    },
    pressed: {
      opacity: 0.85,
    },
    buttonLabel: {
      ...theme.typography.button,
      color: theme.colors.textPrimary,
    },
  });
