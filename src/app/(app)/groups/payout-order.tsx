import { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { PayoutOrderContent } from "../../../components/groups/PayoutOrderContent";
import { HomeTabBar } from "../../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthProvider";
import { useCurrentUser } from "../../../context/CurrentUserProvider";
import { useAssignPayoutOrderMutation } from "../../../hooks/mutations/useAssignPayoutOrderMutation";
import { useGroupDetailsQuery } from "../../../hooks/queries/useGroupDetailsQuery";
import { useRequireGroupCreator } from "../../../hooks/useRequireGroupCreator";
import { useRedirectWhenCycleActive } from "../../../hooks/useRedirectWhenCycleActive";
import { openGroupLedger } from "../../../lib/appNavigation";
import { getJoinedMembers } from "../../../lib/groupMembers";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

type PayoutOrderParams = {
  groupId?: string;
  expectedParticipants?: string;
};

function parseExpectedParticipants(value: string | undefined): number | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function PayoutOrderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const params = useLocalSearchParams<PayoutOrderParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const expectedParticipants = parseExpectedParticipants(
    params.expectedParticipants,
  );
  const currentUserIdentity = {
    id: user?.id ?? currentUser?.id,
    email: user?.email ?? currentUser?.email,
  };

  const identityReady = Boolean(currentUserIdentity.email);

  const {
    data: details,
    isLoading,
    error: queryError,
    refetch,
  } = useGroupDetailsQuery(accessToken, groupId, {
    expectedParticipants,
    currentUser: currentUserIdentity,
    enabled: !!groupId && !!accessToken && identityReady,
  });

  const { canAccess, isChecking } = useRequireGroupCreator({
    groupId,
    details,
    isLoading: isLoading || !identityReady,
    currentUser: currentUserIdentity,
  });

  useRedirectWhenCycleActive({
    groupId,
    details,
    isLoading: isChecking || isLoading,
  });

  const assignMutation = useAssignPayoutOrderMutation(accessToken);

  const members = useMemo(
    () => (details && canAccess ? getJoinedMembers(details.members) : []),
    [canAccess, details],
  );

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  const handleStartContribution = useCallback(
    (orderedMembershipIds: string[]) => {
      if (!groupId || !canAccess) return;

      const assignments = orderedMembershipIds.map((membershipId, index) => ({
        membershipId,
        payoutTurn: index + 1,
      }));

      assignMutation.mutate(
        { groupId, payload: { assignments } },
        {
          onSuccess: () => {
            Alert.alert(
              t("groups.payoutOrder.successTitle"),
              t("groups.payoutOrder.successBody"),
              [
                {
                  text: t("common.ok"),
                  onPress: () => {
                    openGroupLedger(router, groupId, { replace: true });
                  },
                },
              ],
            );
          },
          onError: (error) => {
            const message =
              error instanceof ApiError
                ? error.message
                : t("groups.payoutOrder.errors.generic");
            Alert.alert(t("groups.payoutOrder.errors.title"), message);
          },
        },
      );
    },
    [assignMutation, canAccess, groupId, router, t],
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

  const showCreatorUi = canAccess && !isChecking && details;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.payoutOrder.title")} />

      {isChecking || !showCreatorUi ? (
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
        >
          <PayoutOrderContent
            members={members}
            slotsTotal={
              details.numberOfParticipants ??
              expectedParticipants ??
              members.length
            }
            submitting={assignMutation.isPending}
            onStartContribution={handleStartContribution}
          />
        </ScrollView>
      )}

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
      flexGrow: 1,
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
