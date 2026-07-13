import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { changePassword } from "../../api/profile";
import { ApiError } from "../../api/client";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { useAuth } from "../../context/AuthProvider";
import { isValidPassword } from "../../lib/authValidation";
import { useThemedStyles, type Theme } from "../../theme";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentError, setCurrentError] = useState<string>();
  const [newError, setNewError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setCurrentError(undefined);
    setNewError(undefined);
    setConfirmError(undefined);
    setFormError(undefined);

    let valid = true;

    if (!currentPassword.trim()) {
      setCurrentError(t("profile.changePassword.errors.currentRequired"));
      valid = false;
    }

    if (!isValidPassword(newPassword)) {
      setNewError(t("profile.changePassword.errors.newInvalid"));
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError(t("profile.changePassword.errors.mismatch"));
      valid = false;
    }

    if (!valid || !accessToken) return;

    setSubmitting(true);
    try {
      await changePassword(accessToken, {
        currentPassword,
        newPassword,
      });
      router.back();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("profile.changePassword.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextField
          label={t("profile.changePassword.currentLabel")}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          error={currentError}
          autoCapitalize="none"
          textContentType="password"
        />
        <TextField
          label={t("profile.changePassword.newLabel")}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          error={newError}
          autoCapitalize="none"
          textContentType="newPassword"
        />
        <TextField
          label={t("profile.changePassword.confirmLabel")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={confirmError}
          autoCapitalize="none"
          textContentType="newPassword"
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Button
          label={t("profile.changePassword.save")}
          onPress={() => void handleSave()}
          loading={submitting}
        />
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelLabel}>{t("profile.edit.cancel")}</Text>
        </Pressable>
      </ScrollView>

      <HomeTabBar activeTab="profile" />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    cancelButton: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      color: theme.colors.brand,
    },
    pressed: {
      opacity: 0.85,
    },
  });
