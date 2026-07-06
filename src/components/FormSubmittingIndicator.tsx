import { useEffect } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme, useThemedStyles, type Theme } from "../theme";

type FormSubmittingIndicatorProps = {
  message: string;
  visible: boolean;
};

export function FormSubmittingIndicator({
  message,
  visible,
}: FormSubmittingIndicatorProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (!visible || !message) return;
    void AccessibilityInfo.announceForAccessibility(message);
  }, [visible, message]);

  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={theme.colors.brand} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    message: {
      ...theme.typography.captionMedium,
      color: theme.colors.textSecondary,
    },
  });
