import { type ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../theme";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "default" | "compact";

type ButtonProps = {
  label: string;
  onPress?: PressableProps["onPress"];
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconRight?: ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "default",
  iconRight,
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        size === "compact" && styles.compact,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      {iconRight ? (
        <Ionicons
          name={iconRight}
          size={18}
          color={theme.colors.textPrimary}
          style={styles.icon}
        />
      ) : null}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      height: 48,
      borderRadius: theme.radius.button,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    compact: {
      height: 40,
    },
    primary: {
      backgroundColor: theme.colors.brand,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      ...theme.typography.button,
      color: theme.colors.textPrimary,
    },
    labelDisabled: {
      color: "#9EA2AE",
    },
    icon: {
      marginLeft: theme.spacing.sm,
    },
  });
