import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type HomeUtilityRowProps = {
  languageLabel: string;
  accessibilityLabel: string;
  onLanguagePress?: () => void;
  onAccessibilityPress?: () => void;
};

export function HomeUtilityRow({
  languageLabel,
  accessibilityLabel,
  onLanguagePress,
  onAccessibilityPress,
}: HomeUtilityRowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onLanguagePress}
        accessibilityRole="button"
        accessibilityLabel={languageLabel}
        style={({ pressed }) => [styles.half, pressed && styles.pressed]}
      >
        <Ionicons
          name="globe-outline"
          size={18}
          color={theme.colors.successDark}
        />
        <Text style={styles.label}>{languageLabel}</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={onAccessibilityPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.half, pressed && styles.pressed]}
      >
        <Ionicons
          name="accessibility-outline"
          size={18}
          color={theme.colors.successDark}
        />
        <Text style={styles.label}>{accessibilityLabel}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "stretch",
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.cardFooterBg,
      overflow: "hidden",
    },
    half: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm + 6,
      paddingHorizontal: theme.spacing.sm,
    },
    divider: {
      width: 1,
      alignSelf: "stretch",
      backgroundColor: theme.colors.inputBorder,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
    },
  });
