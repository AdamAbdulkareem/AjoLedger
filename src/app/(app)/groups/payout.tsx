import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { disburseCyclePayout } from "../../../api/groups";
import { ApiError } from "../../../api/client";
import { PayoutContent } from "../../../components/groups/PayoutContent";
import { PayoutPinModal } from "../../../components/groups/PayoutPinModal";
import { HomeTabBar } from "../../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../context/AuthProvider";
import { useCurrentUser } from "../../../context/CurrentUserProvider";
import { useGroupDetailsQuery } from "../../../hooks/queries/useGroupDetailsQuery";
import { useRequireGroupCreator } from "../../../hooks/useRequireGroupCreator";
import { buildPayoutScheduleViewModel } from "../../../lib/buildPayoutSchedule";
import { hasActiveGroupCycle } from "../../../lib/groupCycle";
import {
  invalidateGroupDetailsQueries,
  invalidateGroupsQueries,
} from "../../../lib/invalidateQueries";
import {
  getPendingPayoutDisbursement,
  reconcilePendingPayoutDisbursement,
  rememberPendingPayoutDisbursement,
} from "../../../lib/pendingPayoutDisbursement";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

const PAYOUT_POLL_INTERVAL_MS = 12_000;
const PAYOUT_POLL_MAX_MS = 3 * 60_000;

type PayoutParams = {
  groupId?: string;
};

export default function GroupPayoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const params = useLocalSearchParams<PayoutParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const currentUserIdentity = useMemo(
    () => ({
      id: user?.id ?? currentUser?.id,
      email: user?.email ?? currentUser?.email,
    }),
    [currentUser?.email, currentUser?.id, user?.email, user?.id],
  );
  const identityReady = Boolean(currentUserIdentity.email);

  const [refreshing, setRefreshing] = useState(false);
  const [pendingRound, setPendingRound] = useState<number | null>(null);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [disbursing, setDisbursing] = useState(false);
  const [pollStartedAt, setPollStartedAt] = useState<number | null>(null);

  const {
    data: details,
    isLoading,
    error: queryError,
    refetch,
  } = useGroupDetailsQuery(accessToken, groupId, {
    currentUser: currentUserIdentity,
    enabled: !!groupId && !!accessToken && identityReady,
  });

  const { canAccess, isChecking } = useRequireGroupCreator({
    groupId,
    details,
    isLoading: isLoading || !identityReady,
    currentUser: currentUserIdentity,
  });

  const viewModel = useMemo(
    () =>
      details
        ? buildPayoutScheduleViewModel(details, { pendingRound })
        : null,
    [details, pendingRound],
  );

  const syncPendingState = useCallback(async () => {
    if (!groupId || !details) {
      return;
    }

    const currentRound =
      details.cycleDetails?.currentCycle ??
      details.cycleDetails?.currentWeek ??
      1;
    const reconciled = await reconcilePendingPayoutDisbursement(
      groupId,
      currentRound,
    );
    setPendingRound(reconciled?.round ?? null);
  }, [details, groupId]);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    void getPendingPayoutDisbursement(groupId).then((pending) => {
      setPendingRound(pending?.round ?? null);
    });
  }, [groupId]);

  useEffect(() => {
    void syncPendingState();
  }, [syncPendingState]);

  useFocusEffect(
    useCallback(() => {
      if (!groupId || !accessToken || !identityReady) {
        return;
      }

      void refetch();
      void syncPendingState();
    }, [accessToken, groupId, identityReady, refetch, syncPendingState]),
  );

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!viewModel?.isProcessing) {
      setPollStartedAt(null);
      return;
    }

    const startedAt = pollStartedAt ?? Date.now();
    if (pollStartedAt == null) {
      setPollStartedAt(startedAt);
    }

    const interval = setInterval(() => {
      if (Date.now() - startedAt > PAYOUT_POLL_MAX_MS) {
        clearInterval(interval);
        return;
      }

      void refetch().then(() => syncPendingState());
    }, PAYOUT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pollStartedAt, refetch, syncPendingState, viewModel?.isProcessing]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      await syncPendingState();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, syncPendingState]);

  const handleConfirmPress = useCallback(() => {
    if (!viewModel?.canDisburse) {
      return;
    }

    setPinError(null);
    setPinVisible(true);
  }, [viewModel?.canDisburse]);

  const handleDisburse = useCallback(
    async (transactionPin: string) => {
      if (!accessToken || !details || !viewModel?.cycleId) {
        return;
      }

      setDisbursing(true);
      setPinError(null);

      try {
        const result = await disburseCyclePayout(
          accessToken,
          details.id,
          viewModel.cycleId,
          transactionPin,
        );

        await rememberPendingPayoutDisbursement({
          groupId: details.id,
          round: result.round,
          initiatedAt: new Date().toISOString(),
        });
        setPendingRound(result.round);
        setPinVisible(false);

        await Promise.all([
          invalidateGroupDetailsQueries(accessToken, details.id),
          invalidateGroupsQueries(accessToken),
          refetch(),
        ]);

        Alert.alert(
          t("groups.payout.initiatedTitle"),
          t("groups.payout.initiatedBody"),
        );
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : t("groups.payout.disburseFailed");
        setPinError(message);
      } finally {
        setDisbursing(false);
      }
    },
    [accessToken, details, refetch, t, viewModel?.cycleId],
  );

  const error =
    queryError instanceof ApiError
      ? queryError.message
      : queryError
        ? t("home.errors.generic")
        : null;

  if (!groupId) {
    return null;
  }

  const showPayout =
    canAccess && !isChecking && details && hasActiveGroupCycle(details);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.payout.title")} />

      {!showPayout ? (
        <View style={styles.centered}>
          {error && !details ? (
            <>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                label={t("home.errors.retry")}
                onPress={() => void refetch()}
                variant="secondary"
              />
            </>
          ) : (
            <ActivityIndicator size="large" color={theme.colors.brand} />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={theme.colors.brand}
            />
          }
        >
          <PayoutContent
            group={details}
            pendingRound={pendingRound}
            disbursing={disbursing}
            onConfirmPress={handleConfirmPress}
          />
        </ScrollView>
      )}

      <PayoutPinModal
        visible={pinVisible}
        loading={disbursing}
        error={pinError}
        onClose={() => {
          if (!disbursing) {
            setPinVisible(false);
            setPinError(null);
          }
        }}
        onSubmit={(pin) => void handleDisburse(pin)}
      />

      <HomeTabBar activeTab="groups" />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.groupsScreenBg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
