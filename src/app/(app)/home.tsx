import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AmountRemainsCard } from "../../components/home/AmountRemainsCard";
import { BankDetailsModal } from "../../components/home/BankDetailsModal";
import { BankDetailsSuccessModal } from "../../components/home/BankDetailsSuccessModal";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { RecentActivitySection } from "../../components/home/RecentActivitySection";
import { SavingsOverviewCard } from "../../components/home/SavingsOverviewCard";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthProvider";
import { useCurrentUser } from "../../context/CurrentUserProvider";
import { useProfile } from "../../context/ProfileProvider";
import { useHomeDashboard } from "../../hooks/useHomeDashboard";
import { usePayoutAccountGate } from "../../hooks/usePayoutAccountGate";
import { hasCustomAvatar } from "../../lib/avatarSource";
import {
  getBankSetupSkipped,
  setBankSetupSkipped,
} from "../../lib/bankSetupSkipStorage";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken, user } = useAuth();
  const { displayName, refresh: refreshCurrentUser } = useCurrentUser();
  const { profile } = useProfile();
  const styles = useThemedStyles(createStyles);
  const { data, loading, error, refresh } = useHomeDashboard(
    accessToken,
    displayName,
  );
  const {
    hasPayoutAccount,
    saving: savingPayoutAccount,
    error: payoutAccountError,
    setupBank,
    refresh: refreshPayoutAccount,
    clearError,
  } = usePayoutAccountGate();

  const [bankSetupSkipped, setBankSetupSkippedState] = useState(false);
  const [skipStateLoaded, setSkipStateLoaded] = useState(false);
  const [showBankSaveSuccess, setShowBankSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setBankSetupSkippedState(false);
      setSkipStateLoaded(true);
      return;
    }

    let cancelled = false;
    setSkipStateLoaded(false);

    void getBankSetupSkipped(user.id)
      .then((skipped) => {
        if (!cancelled) setBankSetupSkippedState(skipped);
      })
      .finally(() => {
        if (!cancelled) setSkipStateLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const showBankOnboardingModal =
    skipStateLoaded &&
    hasPayoutAccount === false &&
    !bankSetupSkipped;

  const handleSkipBankSetup = () => {
    if (!user?.id) return;
    void setBankSetupSkipped(user.id).then(() => {
      setBankSetupSkippedState(true);
    });
  };

  const showComingSoon = () => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  };

  const dismissBankSaveSuccess = useCallback(() => {
    setShowBankSaveSuccess(false);
  }, []);

  const handleSetupBank = useCallback(
    async (
      ...args: Parameters<typeof setupBank>
    ): ReturnType<typeof setupBank> => {
      const result = await setupBank(...args);
      if (result === "success") {
        setShowBankSaveSuccess(true);
        void refreshCurrentUser();
      }
      return result;
    },
    [setupBank, refreshCurrentUser],
  );

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
          <View
            style={[
              styles.homeContent,
              showBankSaveSuccess ? styles.homeContentDimmed : null,
            ]}
            pointerEvents={showBankSaveSuccess ? "none" : "auto"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <HomeHeader
                displayName={displayName}
                avatarUrl={
                  profile?.avatarUri && hasCustomAvatar(profile.avatarUri)
                    ? profile.avatarUri
                    : data.avatarUrl
                }
              />

              <SavingsOverviewCard
                group={data.group}
                progress={data.progress}
                payout={data.payout}
                onGroupPress={showComingSoon}
                onDetailsPress={showComingSoon}
              />

              <AmountRemainsCard
                amountRemains={data.amountRemains}
                onPayNowPress={showComingSoon}
              />

              <RecentActivitySection
                items={data.recentActivity}
                viewAllLabel={t("home.viewAll")}
                onViewAllPress={showComingSoon}
                onItemPress={showComingSoon}
              />
            </ScrollView>

            <HomeTabBar activeTab="home" />
          </View>

          <BankDetailsModal
            visible={showBankOnboardingModal}
            accessToken={accessToken}
            saving={savingPayoutAccount}
            error={payoutAccountError}
            onSubmit={handleSetupBank}
            onClearError={clearError}
            variant="onboarding"
            onSkip={handleSkipBankSetup}
            onAlreadyConfigured={() => {
              void refreshPayoutAccount().finally(() => {
                router.push("/(app)/profile");
              });
            }}
          />

          <BankDetailsSuccessModal
            visible={showBankSaveSuccess}
            onDismiss={dismissBankSaveSuccess}
          />
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
    homeContent: {
      flex: 1,
    },
    homeContentDimmed: {
      opacity: 0.45,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      gap: 14,
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
