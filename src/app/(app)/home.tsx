import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { HomeTopBar } from "../../components/home/HomeTopBar";
import { HomeUtilityRow } from "../../components/home/HomeUtilityRow";
import { NextContributionCard } from "../../components/home/NextContributionCard";
import { RecentActivitySection } from "../../components/home/RecentActivitySection";
import { SavingsOverviewCard } from "../../components/home/SavingsOverviewCard";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthProvider";
import { useHomeDashboard } from "../../hooks/useHomeDashboard";
import { getLanguageLabel, type LanguageCode } from "../../i18n/languages";
import { setStoredLanguage } from "../../i18n/languageStorage";
import { deriveDisplayName, getGreetingKey } from "../../lib/greeting";
import { buildHomeSpeechText } from "../../lib/homeSpeech";
import { showLanguagePicker } from "../../lib/showLanguagePicker";
import type { HomeTabKey } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { accessToken, user } = useAuth();
  const styles = useThemedStyles(createStyles);
  const displayNameHint = deriveDisplayName(user?.email);
  const { data, loading, error, refresh } = useHomeDashboard(
    accessToken,
    displayNameHint,
  );

  const speechText = useMemo(() => {
    if (!data) return "";
    return buildHomeSpeechText(t, getGreetingKey(), data);
  }, [data, t, i18n.language]);

  const currentLanguageLabel = getLanguageLabel(i18n.language);

  const showComingSoon = () => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  };

  const handleLanguageSelect = async (code: LanguageCode) => {
    await setStoredLanguage(code);
    await i18n.changeLanguage(code);
  };

  const handleLanguagePress = () => {
    showLanguagePicker({
      t,
      currentLanguage: i18n.language,
      onSelect: (code) => void handleLanguageSelect(code),
    });
  };

  const handleTabPress = (tab: HomeTabKey) => {
    if (tab === "home") return;
    showComingSoon();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
          <Text style={styles.loadingText}>{t("home.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            label={t("home.errors.retry")}
            onPress={() => void refresh()}
            variant="secondary"
          />
        </View>
      ) : data ? (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <HomeTopBar speechText={speechText} />
            <HomeHeader displayName={data.displayName} />

            <SavingsOverviewCard
              group={data.group}
              progress={data.progress}
              payout={data.payout}
              onGroupPress={showComingSoon}
              onDetailsPress={showComingSoon}
            />

            <NextContributionCard
              contribution={data.nextContribution}
              onHowToPayPress={showComingSoon}
            />

            <RecentActivitySection
              items={data.recentActivity}
              viewAllLabel={t("home.viewAll")}
              onViewAllPress={showComingSoon}
              onItemPress={showComingSoon}
            />

            <HomeUtilityRow
              languageLabel={currentLanguageLabel}
              accessibilityLabel={t("home.accessibility")}
              onLanguagePress={() => void handleLanguagePress()}
              onAccessibilityPress={showComingSoon}
            />
          </ScrollView>

          <HomeTabBar activeTab="home" onTabPress={handleTabPress} />
        </>
      ) : null}
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
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
