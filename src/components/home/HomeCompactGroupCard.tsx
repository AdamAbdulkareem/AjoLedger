import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { formatNaira } from "../../lib/formatMoney";
import type { GroupHomeDashboard } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type HomeCompactGroupCardProps = {
  dashboard: GroupHomeDashboard;
  onPress: () => void;
};

export function HomeCompactGroupCard({
  dashboard,
  onPress,
}: HomeCompactGroupCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={dashboard.group.name}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <AjoLedgerLogoMark size={36} variant="square" />
        <View style={styles.textWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {dashboard.group.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {t("home.compactGroupMeta", {
              amount: formatNaira(dashboard.group.amountPerMember),
              progress: dashboard.progress.percent,
            })}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    pressed: {
      opacity: 0.85,
    },
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    textWrap: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...theme.typography.captionMedium,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    meta: {
      ...theme.typography.micro,
      color: theme.colors.textSecondary,
    },
  });
