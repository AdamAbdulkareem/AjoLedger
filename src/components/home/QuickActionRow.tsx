import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type QuickActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  trailingLabel?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function QuickActionRow({
  icon,
  title,
  subtitle,
  onPress,
  trailingLabel,
  accessibilityLabel,
  disabled = false,
}: QuickActionRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={theme.colors.successDark} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {trailingLabel ? (
        <View style={styles.trailingWrap}>
          <Text style={styles.trailingLabel}>{trailingLabel}</Text>
          <Ionicons
            name="chevron-forward"
            size={12}
            color={theme.colors.brand}
          />
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={14}
          color={theme.colors.textPrimary}
        />
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      paddingHorizontal: 10,
      paddingVertical: 10,
      minHeight: 72,
      gap: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.payoutIconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 10,
      lineHeight: 14,
      color: theme.colors.textMuted,
    },
    trailingWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    trailingLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.brand,
    },
  });
