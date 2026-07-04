import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemedStyles, type Theme } from "../../theme";

type ProfileSuccessToastProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
};

export function ProfileSuccessToast({
  message,
  visible,
  onDismiss,
  durationMs = 3500,
}: ProfileSuccessToastProps) {
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, onDismiss, durationMs]);

  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle-outline" size={20} color="#73B18E" />
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
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      paddingVertical: 19,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: "#FEFFFF",
      borderWidth: 1,
      borderColor: "#73B18E",
      borderRadius: 12,
      ...theme.shadows.card,
    },
    message: {
      flex: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 20,
      color: "#0C0C0C",
      textAlign: "center",
    },
  });
