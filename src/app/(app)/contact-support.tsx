import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { HomeTabBar } from "../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { SupportOptionCard } from "../../components/support/SupportOptionCard";
import { useThemedStyles, type Theme } from "../../theme";

export default function ContactSupportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("support.hub.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t("support.hub.heading")}</Text>
        <View style={styles.cards}>
          <SupportOptionCard
            icon="mail-outline"
            title={t("support.hub.email.title")}
            subtitle={t("support.hub.email.subtitle")}
            onPress={() => router.push("/(app)/support-email")}
          />
          <SupportOptionCard
            icon="call-outline"
            title={t("support.hub.phone.title")}
            subtitle={t("support.hub.phone.subtitle")}
            onPress={() => router.push("/(app)/support-phone")}
          />
          <SupportOptionCard
            icon="chatbubble-outline"
            title={t("support.hub.message.title")}
            subtitle={t("support.hub.message.subtitle")}
            onPress={() => router.push("/(app)/support-message")}
          />
        </View>
      </ScrollView>

      <HomeTabBar activeTab="profile" />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    heading: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 28,
      color: "#181C21",
    },
    cards: {
      gap: theme.spacing.md,
    },
  });
