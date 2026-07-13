import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type SupportOptionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function SupportOptionCard({
  icon,
  title,
  subtitle,
  onPress,
}: SupportOptionCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={theme.colors.textPrimary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.colors.textPrimary}
      />
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.carouselCardBg,
      borderWidth: 1,
      borderColor: "#EFEFF1",
      borderRadius: 12,
      padding: theme.spacing.md,
      minHeight: 76,
    },
    pressed: {
      opacity: 0.85,
    },
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      width: 24,
      height: 24,
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
      color: "#1C1C1C",
    },
    subtitle: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.cardBorderMuted,
    },
  });
