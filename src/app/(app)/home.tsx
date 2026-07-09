import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FirstTimeHomeHero } from "../../components/home/FirstTimeHomeHero";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { QuickActionsSection } from "../../components/home/QuickActionsSection";
import { RegisteredHomeContent } from "../../components/home/RegisteredHomeContent";
import { WhySaveWithAjoLedger } from "../../components/home/WhySaveWithAjoLedger";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthProvider";
import { useCurrentUser } from "../../context/CurrentUserProvider";
import { useProfile } from "../../context/ProfileProvider";
import { usePayoutAccountGate } from "../../hooks/usePayoutAccountGate";
import { useRecentActivity } from "../../hooks/useRecentActivity";
import { useRequirePayoutBank } from "../../hooks/useRequirePayoutBank";
import { useUserGroups } from "../../hooks/useUserGroups";
import { useOpenGroup } from "../../hooks/useOpenGroup";
import { useSyncCreatorBadges } from "../../hooks/useSyncCreatorBadges";
import { openGroupsTab } from "../../lib/appNavigation";
import { hasCustomAvatar } from "../../lib/avatarSource";
import { buildRegisteredHomeData } from "../../lib/buildHomeDashboardFromGroups";
import {
  getBankSetupSkipped,
  setBankSetupSkipped,
} from "../../lib/bankSetupSkipStorage";
import type { RecentActivityItem } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken, user, status } = useAuth();
  const { displayName, refresh: refreshCurrentUser } = useCurrentUser();
  const { profile } = useProfile();
  const styles = useThemedStyles(createStyles);
  const isAuthenticated = status === "authenticated";
  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    refresh: refreshGroups,
  } = useUserGroups(accessToken, isAuthenticated);

  const { openGroupById, openGroupForPayment } = useOpenGroup();

  const hasGroups = groups.length > 0;

  useSyncCreatorBadges(accessToken, groups, isAuthenticated && hasGroups);

  const {
    items: recentActivity,
    loading: activityLoading,
    error: activityError,
    refresh: refreshActivity,
  } = useRecentActivity(accessToken, isAuthenticated && hasGroups);

  const {
    hasPayoutAccount,
    saving: savingPayoutAccount,
    error: payoutAccountError,
    setupBank,
    refresh: refreshPayoutAccount,
    clearError,
  } = usePayoutAccountGate();

  const { requireBank, payoutLoading, bankModalProps: requiredBankModalProps } =
    useRequirePayoutBank();

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

  const isFirstTimeUser = !groupsLoading && !hasGroups;

  const handleSkipBankSetup = () => {
    if (!user?.id) return;
    void setBankSetupSkipped(user.id).then(() => {
      setBankSetupSkippedState(true);
    });
  };

  const handleJoinOrCreatePress = useCallback(() => {
    openGroupsTab(router);
  }, [router]);

  const showComingSoon = useCallback(() => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  }, [t]);

  const handleCreateGroupPress = useCallback(() => {
    requireBank(() => {
      router.push("/(app)/groups/create");
    });
  }, [requireBank, router]);

  const handleJoinGroupPress = useCallback(() => {
    requireBank(() => {
      router.push("/(app)/groups/join");
    });
  }, [requireBank, router]);

  const handleOpenGroup = useCallback(
    (groupId: string) => {
      void openGroupById(groupId, groups);
    },
    [groups, openGroupById],
  );

  const handlePayNow = useCallback(
    (groupId: string) => {
      openGroupForPayment(groupId);
    },
    [openGroupForPayment],
  );

  const handleViewAllActivityPress = useCallback(() => {
    openGroupsTab(router);
  }, [router]);

  const handleActivityPress = useCallback(
    (item: RecentActivityItem) => {
      if (!item.groupId) {
        return;
      }

      void openGroupById(item.groupId, groups);
    },
    [groups, openGroupById],
  );

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

  const avatarUrl =
    profile?.avatarUri && hasCustomAvatar(profile.avatarUri)
      ? profile.avatarUri
      : null;

  const registeredHomeData = useMemo(() => {
    if (!hasGroups) {
      return null;
    }

    const base = buildRegisteredHomeData(groups, displayName, avatarUrl);
    if (!base) {
      return null;
    }

    // Prefer live activity when the API returns items. Fall back to mock
    // placeholders while loading, on empty responses (endpoint not live yet),
    // or on fetch errors so the home section still renders.
    const resolvedActivity =
      !activityLoading && !activityError && recentActivity.length > 0
        ? recentActivity
        : base.recentActivity;

    return {
      ...base,
      recentActivity: resolvedActivity,
      recentActivityError: null,
    };
  }, [hasGroups, groups, displayName, avatarUrl, recentActivity, activityLoading, activityError]);

  const handleRetry = () => {
    void refreshGroups();
    void refreshActivity();
  };

  const renderBody = () => {
    if (isFirstTimeUser) {
      return (
        <>
          <HomeHeader displayName={displayName} avatarUrl={avatarUrl} />
          <FirstTimeHomeHero onJoinOrCreatePress={handleJoinOrCreatePress} />
          <WhySaveWithAjoLedger />
          <QuickActionsSection
            onJoinGroupPress={handleJoinGroupPress}
            onCreateGroupPress={handleCreateGroupPress}
            onContactSupportPress={showComingSoon}
            actionsLoading={payoutLoading}
          />
        </>
      );
    }

    if (!registeredHomeData) return null;

    return (
      <RegisteredHomeContent
        data={registeredHomeData}
        onGroupPress={handleOpenGroup}
        onPayNowPress={handlePayNow}
        onDetailsPress={handleOpenGroup}
        onViewAllActivityPress={handleViewAllActivityPress}
        onActivityPress={handleActivityPress}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {groupsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
          <Text style={styles.loadingText}>{t("home.loading")}</Text>
        </View>
      ) : groupsError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{groupsError}</Text>
          <Button
            label={t("home.errors.retry")}
            onPress={handleRetry}
            variant="secondary"
          />
        </View>
      ) : (
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
              {renderBody()}
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
                router.replace("/(app)/profile");
              });
            }}
          />

          <BankDetailsSuccessModal
            visible={showBankSaveSuccess}
            onDismiss={dismissBankSaveSuccess}
          />

          <BankDetailsModal {...requiredBankModalProps} />
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.groupsScreenBg,
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
