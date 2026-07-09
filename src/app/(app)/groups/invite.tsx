import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn } from "react-native-reanimated";

import { GroupInviteContent } from "../../../components/groups/GroupInviteContent";
import { HomeTabBar } from "../../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthProvider";
import { useGroupDetailsQuery } from "../../../hooks/queries/useGroupDetailsQuery";
import { startInvitePolling } from "../../../lib/invitePolling";
import { mapJoinedMembersForInvite } from "../../../lib/groupMembers";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

const LOGO_MARK = require("../../../../assets/groups/ajoledger-logo-mark.png");

type InviteParams = {
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

export default function GroupInviteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();
  const params = useLocalSearchParams<InviteParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const expectedParticipants = parseExpectedParticipants(params.expectedParticipants);
  const memberCountRef = useRef(0);

  const {
    data: details,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGroupDetailsQuery(accessToken, groupId, {
    expectedParticipants,
    enabled: !!groupId && !!accessToken,
  });

  const members = useMemo(
    () => (details ? mapJoinedMembersForInvite(details.members) : []),
    [details],
  );

  memberCountRef.current = members.length;

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  useFocusEffect(
    useCallback(() => {
      if (!groupId || !accessToken) {
        return;
      }

      void refetch();

      return startInvitePolling({
        enabled: true,
        poll: () => {
          void refetch();
        },
        getMemberCount: () => memberCountRef.current,
      });
    }, [accessToken, groupId, refetch]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCheckPayoutOrder = useCallback(() => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  }, [t]);

  const error =
    queryError instanceof ApiError
      ? queryError.message
      : queryError
        ? t("home.errors.generic")
        : null;

  if (!groupId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.invite.title")} />

      {isLoading && !details ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
      ) : error && !details ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            label={t("home.errors.retry")}
            onPress={() => void refetch()}
            variant="secondary"
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || (isFetching && !isLoading)}
              onRefresh={() => void handleRefresh()}
              tintColor={theme.colors.brand}
            />
          }
        >
          <Animated.View entering={FadeIn.duration(350)} style={styles.logoWrap}>
            <Image
              source={LOGO_MARK}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>

          <GroupInviteContent
            inviteCode={details?.inviteCode ?? ""}
            members={members}
            onCheckPayoutOrder={handleCheckPayoutOrder}
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
      paddingHorizontal: theme.spacing.md + 3,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    logoWrap: {
      alignItems: "center",
      marginBottom: theme.spacing.sm + 4,
    },
    logo: {
      width: 50,
      height: 50,
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
