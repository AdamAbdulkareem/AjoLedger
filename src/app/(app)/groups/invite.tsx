import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { getGroupDetails } from "../../../api/groups";
import { useAuth } from "../../../context/AuthProvider";
import { GROUP_INVITE_POLL_MS } from "../../../lib/groupInvite";
import { mapJoinedMembersForInvite } from "../../../lib/groupMembers";
import type { GroupInviteMember } from "../../../lib/groupMembers";
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<GroupInviteMember[]>([]);

  const loadGroup = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!groupId || !accessToken) {
        if (!options?.silent) {
          setError(t("home.errors.generic"));
          setLoading(false);
        }
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const details = await getGroupDetails(accessToken, groupId, {
          expectedParticipants,
        });
        setInviteCode(details.inviteCode);
        setMembers(mapJoinedMembersForInvite(details.members));
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
    [accessToken, expectedParticipants, groupId, t],
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

  const handleCheckPayoutOrder = useCallback(() => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  }, [t]);

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
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
            inviteCode={inviteCode}
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
