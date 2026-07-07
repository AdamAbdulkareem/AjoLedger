import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupsActionCardProps = {
  variant: "join" | "create";
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function GroupsActionCard({
  variant,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: GroupsActionCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const isJoin = variant === "join";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.card,
        isJoin ? styles.joinCard : styles.createCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={isJoin ? "people" : "add"}
          size={20}
          color={isJoin ? theme.colors.textPrimary : theme.colors.surface}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, !isJoin && styles.createTitle]}>{title}</Text>
        <Text style={[styles.subtitle, !isJoin && styles.createSubtitle]}>
          ({subtitle})
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      borderRadius: 20,
      padding: 10,
      minHeight: 58,
    },
    joinCard: {
      backgroundColor: theme.colors.brand,
    },
    createCard: {
      backgroundColor: theme.colors.groupCreateBg,
    },
    pressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 26,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      alignItems: "center",
      gap: 2,
      flexShrink: 1,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    createTitle: {
      color: theme.colors.surface,
    },
    subtitle: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    createSubtitle: {
      color: theme.colors.surface,
      fontFamily: theme.fontFamily.regular,
    },
  });
