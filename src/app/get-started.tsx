import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemedStyles, type Theme } from "../theme";

export default function GetStarted() {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subtitle}>
        Placeholder screen. The authentication flow will be built here next.
      </Text>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    title: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });
