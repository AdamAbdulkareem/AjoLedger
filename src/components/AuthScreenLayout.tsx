import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "./LanguagePicker";
import { useThemedStyles, type Theme } from "../theme";

type AuthScreenLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenLayout({ children, footer }: AuthScreenLayoutProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>{children}</View>
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.languagePicker}>
        <LanguagePicker />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      justifyContent: "center",
    },
    content: {
      gap: theme.spacing.lg,
    },
    languagePicker: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
  });
