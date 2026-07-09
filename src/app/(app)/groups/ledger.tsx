import { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { GroupLedgerContent } from "../../../components/groups/GroupLedgerContent";
import { HomeTabBar } from "../../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthProvider";
import { useCurrentUser } from "../../../context/CurrentUserProvider";
import { useGroupDetailsQuery } from "../../../hooks/queries/useGroupDetailsQuery";
import { openGroupDetail, openGroupInvite } from "../../../lib/appNavigation";
import { hasActiveGroupCycle, isPreCycleGroup } from "../../../lib/groupCycle";
import { isGroupAdminForCurrentUser } from "../../../lib/groupApiNormalize";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

type LedgerParams = {
  groupId?: string;
};

export default function GroupLedgerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const params = useLocalSearchParams<LedgerParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";
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
    currentUser: currentUserIdentity,
    enabled: !!groupId && !!accessToken && identityReady,
  });

  const isAdmin =
    details != null && isGroupAdminForCurrentUser(details, currentUserIdentity);

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  useEffect(() => {
    if (isLoading || !details || !groupId) {
      return;
    }

    if (isPreCycleGroup(details)) {
      if (isGroupAdminForCurrentUser(details, currentUserIdentity)) {
        openGroupInvite(router, groupId, details.numberOfParticipants);
        return;
      }

      openGroupDetail(router, groupId, { replace: true });
    }
  }, [currentUserIdentity, details, groupId, isLoading, router]);

  const error =
    queryError instanceof ApiError
      ? queryError.message
      : queryError
        ? t("home.errors.generic")
        : null;

  if (!groupId) {
    return null;
  }

  const showLedger = details && hasActiveGroupCycle(details);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.ledger.title")} />

      {!showLedger ? (
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
          <GroupLedgerContent group={details} isAdmin={isAdmin} />
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
