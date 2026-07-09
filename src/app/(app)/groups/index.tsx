import { useCallback, useMemo } from "react";
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

import { BankDetailsModal } from "../../../components/home/BankDetailsModal";
import { HomeTabBar } from "../../../components/home/HomeTabBar";
import { NewUserGroupsContent } from "../../../components/groups/NewUserGroupsContent";
import { ReturningUserGroupsContent } from "../../../components/groups/ReturningUserGroupsContent";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../context/AuthProvider";
import { useOpenGroup } from "../../../hooks/useOpenGroup";
import { useRequirePayoutBank } from "../../../hooks/useRequirePayoutBank";
import { useUserGroups } from "../../../hooks/useUserGroups";
import type { GroupSummary } from "../../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

type GroupsParams = {
  joinedGroupName?: string;
};

export default function GroupsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken, status } = useAuth();
  const { requireBank, payoutLoading, bankModalProps } = useRequirePayoutBank();
  const params = useLocalSearchParams<GroupsParams>();
  const isAuthenticated = status === "authenticated";
  const { groups, loading, error, refresh, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserGroups(accessToken, isAuthenticated);
  const hasGroups = groups.length > 0;
  const { openGroup, openingGroupId } = useOpenGroup();

  const joinedGroupName =
    typeof params.joinedGroupName === "string" ? params.joinedGroupName : "";

  const joinedSuccessMessage = useMemo(() => {
    if (!joinedGroupName) {
      return undefined;
    }
    return t("groups.join.successMessage", { name: joinedGroupName });
  }, [joinedGroupName, t]);

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

  const handleGroupPress = useCallback(
    (group: GroupSummary) => {
      void openGroup(group);
    },
    [openGroup],
  );

  const handleBack = useCallback(() => {
    router.replace("/(app)/home");
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader
        title={t("groups.title")}
        onBackPress={handleBack}
        trailingAction={
          hasGroups && !loading && !error
            ? {
                label: t("groups.joinButton"),
                onPress: handleJoinGroupPress,
                accessibilityLabel: t("groups.joinButton"),
              }
            : undefined
        }
      />

      {loading || payoutLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
          <Text style={styles.loadingText}>{t("groups.loading")}</Text>
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
      ) : hasGroups ? (
        <ReturningUserGroupsContent
          groups={groups}
          joinedSuccessMessage={joinedSuccessMessage}
          openingGroupId={openingGroupId}
          onCreateGroupPress={handleCreateGroupPress}
          onGroupPress={(group) => void handleGroupPress(group)}
          onEndReached={() => void fetchNextPage()}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <NewUserGroupsContent
            onEnterCodePress={handleJoinGroupPress}
            onJoinGroupPress={handleJoinGroupPress}
            onCreateGroupPress={handleCreateGroupPress}
          />
        </ScrollView>
      )}

      <HomeTabBar activeTab="groups" />

      <BankDetailsModal {...bankModalProps} />
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
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
