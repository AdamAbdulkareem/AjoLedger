import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { GroupInviteContent } from "../../../components/groups/GroupInviteContent";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { ApiError } from "../../../api/client";
import { getGroupDetails } from "../../../api/groups";
import { useAuth } from "../../../context/AuthProvider";
import { GROUP_INVITE_POLL_MS } from "../../../lib/groupInvite";
import { mapJoinedMembersForInvite } from "../../../lib/groupMembers";
import type { GroupInviteMember } from "../../../lib/groupMembers";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

type InviteParams = {
  groupId?: string;
};

export default function GroupInviteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();
  const params = useLocalSearchParams<InviteParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<GroupInviteMember[]>([]);
  const [joinedCount, setJoinedCount] = useState(0);
  const [numberOfParticipants, setNumberOfParticipants] = useState(0);

  const loadGroup = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!groupId || !accessToken) {
        setError(t("home.errors.generic"));
        setLoading(false);
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const details = await getGroupDetails(accessToken, groupId);
        setGroupName(details.name);
        setInviteCode(details.inviteCode);
        setMembers(mapJoinedMembersForInvite(details.members));
        setJoinedCount(details.joinedCount);
        setNumberOfParticipants(details.numberOfParticipants);
      } catch (err) {
        if (!options?.silent) {
          setError(
            err instanceof ApiError
              ? err.message
              : t("home.errors.generic"),
          );
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [accessToken, groupId, t],
  );

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  useFocusEffect(
    useCallback(() => {
      if (!groupId) {
        return;
      }

      void loadGroup();
      const timer = setInterval(
        () => void loadGroup({ silent: true }),
        GROUP_INVITE_POLL_MS,
      );

      return () => clearInterval(timer);
    }, [groupId, loadGroup]),
  );

  const handleDone = useCallback(() => {
    router.replace("/(app)/groups");
  }, [router]);

  if (!groupId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.invite.title")} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            label={t("home.errors.retry")}
            onPress={() => void loadGroup()}
            variant="secondary"
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GroupInviteContent
            groupName={groupName}
            inviteCode={inviteCode}
            members={members}
            joinedCount={joinedCount}
            numberOfParticipants={numberOfParticipants}
            onDone={handleDone}
          />
        </ScrollView>
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
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
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
