import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/Button";
import { VoiceButton } from "../../components/VoiceButton";
import { useAuth } from "../../context/AuthProvider";
import { useThemedStyles, type Theme } from "../../theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const styles = useThemedStyles(createStyles);

  const speechText = `${t("home.greeting")}. ${t("home.signedInAs", { email: user?.email ?? "" })}`;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <VoiceButton text={speechText} />
        <Text style={styles.title}>{t("home.greeting")}</Text>
        <Text style={styles.subtitle}>
          {t("home.signedInAs", { email: user?.email ?? "" })}
        </Text>
        <Text style={styles.note}>{t("home.placeholderNote")}</Text>
      </View>
      <Button label={t("auth.logOut")} onPress={handleLogout} />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      justifyContent: "space-between",
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
      textAlign: "center",
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    note: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: theme.spacing.md,
    },
  });
