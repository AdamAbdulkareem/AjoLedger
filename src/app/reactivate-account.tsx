import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { reactivateAccount } from "../api/profile";
import { ApiError } from "../api/client";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthProvider";
import { invalidateUserQueries } from "../lib/invalidateQueries";
import { useThemedStyles, type Theme } from "../theme";

export default function ReactivateAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken, clearAccountDeactivated, logout } = useAuth();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    if (!accessToken) return;

    setError(undefined);
    setLoading(true);

    try {
      await reactivateAccount(accessToken);
      clearAccountDeactivated();
      await invalidateUserQueries(accessToken);
      router.replace("/(app)/home");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("profile.reactivate.title")}</Text>
        <Text style={styles.body}>{t("profile.reactivate.body")}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={t("profile.reactivate.confirm")}
          onPress={() => void handleReactivate()}
          loading={loading}
        />
        <Button
          label={t("profile.logoutConfirm")}
          onPress={() => void logout()}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    content: {
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
