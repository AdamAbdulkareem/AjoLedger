import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { BankDetailsModal } from "../../components/home/BankDetailsModal";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { NewUserGroupsContent } from "../../components/groups/NewUserGroupsContent";
import { ReturningUserGroupsContent } from "../../components/groups/ReturningUserGroupsContent";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { Button } from "../../components/Button";
import { isUserGroupCreator } from "../../api/groups";
import { useAuth } from "../../context/AuthProvider";
import { useRequirePayoutBank } from "../../hooks/useRequirePayoutBank";
import { useUserGroups } from "../../hooks/useUserGroups";
import { isGroupCreator } from "../../lib/groupApiNormalize";
import type { GroupSummary } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupsParams = {
  joinedGroupName?: string;
};

export default function GroupsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();
  const { requireBank, payoutLoading, bankModalProps } = useRequirePayoutBank();
  const params = useLocalSearchParams<GroupsParams>();

  const { groups, loading, error, refresh } = useUserGroups(accessToken);
  const hasGroups = groups.length > 0;
  const [openingGroupId, setOpeningGroupId] = useState<string | null>(null);

  const joinedGroupName =
    typeof params.joinedGroupName === "string" ? params.joinedGroupName : "";

  const joinedSuccessMessage = useMemo(() => {
    if (!joinedGroupName) {
      return undefined;
    }
    return t("groups.join.successMessage", { name: joinedGroupName });
  }, [joinedGroupName, t]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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

  const openInvitationScreen = useCallback(
    (groupId: string) => {
      router.push({
        pathname: "/(app)/groups/invite",
        params: { groupId },
      });
    },
    [router],
  );

  const openGroupDetail = useCallback(
    (groupId: string) => {
      router.push({
        pathname: "/(app)/groups/[groupId]",
        params: { groupId },
      });
    },
    [router],
  );

  const handleGroupPress = useCallback(
    async (group: GroupSummary) => {
      if (openingGroupId) {
        return;
      }

      if (isGroupCreator(group)) {
        openInvitationScreen(group.id);
        return;
      }

      if (!accessToken) {
        Alert.alert(t("home.errors.generic"));
        return;
      }

      setOpeningGroupId(group.id);

      try {
        const creator = await isUserGroupCreator(accessToken, group.id, group);
        if (creator) {
          openInvitationScreen(group.id);
          return;
        }

        openGroupDetail(group.id);
      } catch (error) {
        console.error("Failed to check group creator status:", error);
        Alert.alert(t("home.errors.generic"));
      } finally {
        setOpeningGroupId(null);
      }
    },
    [accessToken, openGroupDetail, openInvitationScreen, openingGroupId, t],
  );

  const handleBack = useCallback(() => {
    router.push("/(app)/home");
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.title")} onBackPress={handleBack} />

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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ReturningUserGroupsContent
            groups={groups}
            joinedSuccessMessage={joinedSuccessMessage}
            openingGroupId={openingGroupId}
            onEnterCodePress={handleJoinGroupPress}
            onCreateGroupPress={handleCreateGroupPress}
            onGroupPress={(group) => void handleGroupPress(group)}
          />
        </ScrollView>
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
