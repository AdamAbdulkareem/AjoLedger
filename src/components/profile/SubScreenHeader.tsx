import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type SubScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
};

export function SubScreenHeader({ title, onBackPress }: SubScreenHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t("common.goBack")}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    backButton: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    spacer: {
      width: 24,
      height: 24,
    },
    pressed: {
      opacity: 0.85,
    },
  });
