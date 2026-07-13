import { useCallback, useEffect, useState } from "react";
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

import { GroupDetailContent } from "../../../components/groups/GroupDetailContent";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { Button } from "../../../components/Button";
import { ApiError } from "../../../api/client";
import { getGroupDetails } from "../../../api/groups";
import { useAuth } from "../../../context/AuthProvider";
import { useRedirectWhenCycleActive } from "../../../hooks/useRedirectWhenCycleActive";
import type { GroupDetails } from "../../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../../theme";

type GroupDetailParams = {
  groupId?: string;
};

export default function GroupDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { accessToken, user } = useAuth();
  const params = useLocalSearchParams<GroupDetailParams>();

  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupDetails | null>(null);

  const loadGroup = useCallback(async () => {
    if (!groupId || !accessToken) {
      setError(t("home.errors.generic"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await getGroupDetails(accessToken, groupId, {
        currentUser: { id: user?.id, email: user?.email },
      });
      setGroup(details);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId, t, user?.email, user?.id]);

  useEffect(() => {
    if (!groupId) {
      router.replace("/(app)/groups");
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!groupId) return;
    void loadGroup();
  }, [groupId, loadGroup]);

  useRedirectWhenCycleActive({
    groupId,
    details: group ?? undefined,
    isLoading: loading,
  });

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(app)/groups");
  }, [router]);

  if (!groupId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.detail.title")} onBackPress={handleBack} />

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
      ) : group ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GroupDetailContent
            group={group}
            accessToken={accessToken}
            onPaymentConfirmed={() => void loadGroup()}
          />
        </ScrollView>
      ) : null}
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
