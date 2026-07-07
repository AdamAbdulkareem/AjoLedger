import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type SubScreenHeaderTrailingAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

type SubScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
  trailingAction?: SubScreenHeaderTrailingAction;
};

const SIDE_SLOT_WIDTH = 88;

export function SubScreenHeader({
  title,
  onBackPress,
  trailingAction,
}: SubScreenHeaderProps) {
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
      <View style={styles.sideSlot}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t("common.goBack")}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>
        {trailingAction ? (
          <Pressable
            onPress={trailingAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={
              trailingAction.accessibilityLabel ?? trailingAction.label
            }
            style={({ pressed }) => [
              styles.trailingButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.trailingLabel}>{trailingAction.label}</Text>
          </Pressable>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    sideSlot: {
      width: SIDE_SLOT_WIDTH,
      justifyContent: "center",
    },
    sideSlotRight: {
      alignItems: "flex-end",
    },
    backButton: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    sideSpacer: {
      width: 24,
      height: 24,
    },
    trailingButton: {
      backgroundColor: theme.colors.brand,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    trailingLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
