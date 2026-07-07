import { type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type ProfileMenuRowProps = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  showChevron?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  toggleDisabled?: boolean;
  accessibilityLabel?: string;
};

export function ProfileMenuRow({
  icon,
  label,
  onPress,
  trailing,
  showChevron = false,
  toggleValue,
  onToggleChange,
  toggleDisabled = false,
  accessibilityLabel,
}: ProfileMenuRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const isToggle = onToggleChange !== undefined;

  const content = (
    <>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {trailing}
        {showChevron ? (
          <Ionicons name="chevron-forward" size={14} color="#2C3138" />
        ) : null}
        {isToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            disabled={toggleDisabled}
            trackColor={{ false: theme.colors.cardBorderMuted, true: theme.colors.brand }}
            thumbColor={theme.colors.surface}
            accessibilityLabel={accessibilityLabel ?? label}
          />
        ) : null}
      </View>
    </>
  );

  if (isToggle || !onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.surface,
      borderWidth: 0.2,
      borderColor: theme.colors.activityListBorder,
      borderRadius: 8,
    },
    pressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    labelRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    label: {
      flex: 1,
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: "#181C21",
    },
  });
