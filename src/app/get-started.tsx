import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { LanguagePicker } from "../components/LanguagePicker";
import { VoiceButton } from "../components/VoiceButton";
import { useThemedStyles, type Theme } from "../theme";

export default function GetStarted() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const speechText = `${t("getStarted.title")}. ${t("getStarted.subtitle")}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <VoiceButton text={speechText} />
        <Text style={styles.title}>{t("getStarted.title")}</Text>
        <Text style={styles.subtitle}>{t("getStarted.subtitle")}</Text>
      </View>
      <LanguagePicker />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
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
