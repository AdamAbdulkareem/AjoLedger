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

import { AmountRemainsCard } from "../../components/home/AmountRemainsCard";
import { BankDetailsModal } from "../../components/home/BankDetailsModal";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { RecentActivitySection } from "../../components/home/RecentActivitySection";
import { SavingsOverviewCard } from "../../components/home/SavingsOverviewCard";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthProvider";
import { useProfile } from "../../context/ProfileProvider";
import { useHomeDashboard } from "../../hooks/useHomeDashboard";
import { usePayoutAccountGate } from "../../hooks/usePayoutAccountGate";
import { hasCustomAvatar } from "../../lib/avatarSource";
import { deriveDisplayName } from "../../lib/greeting";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accessToken, user } = useAuth();
  const { profile } = useProfile();
  const styles = useThemedStyles(createStyles);
  const displayNameHint =
    profile?.fullName?.trim() || deriveDisplayName(user?.email);
  const { data, loading, error, refresh } = useHomeDashboard(
    accessToken,
    displayNameHint,
  );
  const {
    hasPayoutAccount,
    saving: savingPayoutAccount,
    error: payoutAccountError,
    save: savePayoutAccount,
  } = usePayoutAccountGate();

  const showComingSoon = () => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
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
            <HomeHeader
              displayName={profile?.fullName?.trim() || data.displayName}
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

          <BankDetailsModal
            visible={hasPayoutAccount === false}
            saving={savingPayoutAccount}
            error={payoutAccountError}
            onSubmit={savePayoutAccount}
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
