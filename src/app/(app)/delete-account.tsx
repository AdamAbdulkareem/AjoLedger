import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import {
  initiateAccountDeletion,
  reactivateAccount,
  verifyAccountDeletion,
} from "../../api/profile";
import { ApiError } from "../../api/client";
import { DeleteAccountLogo } from "../../components/profile/DeleteAccountLogo";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { OtpDigitInput } from "../../components/profile/OtpDigitInput";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { useAuth } from "../../context/AuthProvider";
import { useCurrentUser } from "../../context/CurrentUserProvider";
import {
  DELETE_ACCOUNT_REASONS,
  reasonIdToApiValue,
  type DeleteAccountReasonId,
} from "../../lib/deleteAccountReasons";
import { invalidateUserQueries } from "../../lib/invalidateQueries";
import { maskEmail } from "../../lib/maskEmail";
import { useThemedStyles, type Theme } from "../../theme";

type Step = "reasons" | "lastChance" | "otp" | "deactivated";

const RESEND_SECONDS = 56;

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken, logout, clearAccountDeactivated } = useAuth();
  const { email } = useCurrentUser();

  const [step, setStep] = useState<Step>("reasons");
  const [selectedReason, setSelectedReason] = useState<DeleteAccountReasonId>();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const maskedEmail = maskEmail(email);

  useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, resendSeconds]);

  const handleBack = useCallback(() => {
    if (step === "lastChance") {
      setStep("reasons");
      return;
    }
    if (step === "otp") {
      setStep("lastChance");
      return;
    }
    router.back();
  }, [router, step]);

  const handleInitiate = useCallback(async () => {
    if (!accessToken || !selectedReason) return;

    setFormError(undefined);
    setLoading(true);

    try {
      const result = await initiateAccountDeletion(
        accessToken,
        reasonIdToApiValue(selectedReason, t),
      );
      if (result.otp) {
        setOtp(result.otp);
      }
      setResendSeconds(RESEND_SECONDS);
      setStep("otp");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedReason, t]);

  const handleResend = useCallback(async () => {
    if (!accessToken || !selectedReason || resendSeconds > 0 || loading) return;
    await handleInitiate();
  }, [accessToken, selectedReason, resendSeconds, loading, handleInitiate]);

  const handleVerify = useCallback(async () => {
    if (!accessToken) return;

    setOtpError(undefined);
    setFormError(undefined);

    const trimmed = otp.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setOtpError(t("profile.deleteAccount.errors.invalidOtp"));
      return;
    }

    setLoading(true);
    try {
      await verifyAccountDeletion(accessToken, trimmed);
      setStep("deactivated");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, otp, t]);

  const handleDone = useCallback(async () => {
    await logout();
    router.replace("/register");
  }, [logout, router]);

  const handleReactivate = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setFormError(undefined);
    try {
      await reactivateAccount(accessToken);
      clearAccountDeactivated();
      await invalidateUserQueries(accessToken);
      router.replace("/(app)/home");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : t("home.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, clearAccountDeactivated, router, t]);

  const canDelete = Boolean(selectedReason) && !loading;
  const canVerify = otp.length === 6 && !loading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader
        title={t("profile.deleteAccount.title")}
        onBackPress={step === "deactivated" ? undefined : handleBack}
      />
      <DeleteAccountLogo />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === "reasons" ? (
          <>
            <Text style={styles.intro}>{t("profile.deleteAccount.intro")}</Text>
            <View style={styles.reasonList}>
              {DELETE_ACCOUNT_REASONS.map((reasonId) => {
                const selected = selectedReason === reasonId;
                return (
                  <Pressable
                    key={reasonId}
                    onPress={() => setSelectedReason(reasonId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    style={styles.reasonRow}
                  >
                    <View
                      style={[styles.checkbox, selected && styles.checkboxSelected]}
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={16} color="#1C1C1C" />
                      ) : null}
                    </View>
                    <Text style={styles.reasonLabel}>
                      {t(`profile.deleteAccount.reasons.${reasonId}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <View style={styles.footerActions}>
              <DeleteFooterButton
                label={t("profile.edit.cancel")}
                variant="muted"
                onPress={() => router.back()}
              />
              <DeleteFooterButton
                label={t("profile.deleteAccount.deleteCta")}
                variant="outline"
                disabled={!canDelete}
                onPress={() => setStep("lastChance")}
              />
            </View>
          </>
        ) : null}

        {step === "lastChance" ? (
          <>
            <View style={styles.lastChanceCopy}>
              <Text style={styles.lastChanceLead}>
                {t("profile.deleteAccount.lastChance.lead")}
              </Text>
              <Text style={styles.lastChanceBody}>
                {t("profile.deleteAccount.lastChance.body")}
              </Text>
              <Text style={styles.lastChanceQuestion}>
                {t("profile.deleteAccount.lastChance.question")}
              </Text>
            </View>
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <View style={styles.footerActions}>
              <DeleteFooterButton
                label={t("profile.deleteAccount.lastChance.yes")}
                variant="outlineBrand"
                disabled={loading}
                loading={loading}
                onPress={() => void handleInitiate()}
              />
              <DeleteFooterButton
                label={t("profile.deleteAccount.lastChance.no")}
                variant="primary"
                disabled={loading}
                onPress={() => setStep("reasons")}
              />
            </View>
          </>
        ) : null}

        {step === "otp" ? (
          <>
            <View style={styles.otpCopy}>
              <Text style={styles.otpTitle}>
                {t("profile.deleteAccount.otp.title")}
              </Text>
              <Text style={styles.otpBody}>
                {t("profile.deleteAccount.otp.body", { email: maskedEmail })}
              </Text>
            </View>
            <OtpDigitInput
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                setOtpError(undefined);
              }}
              error={otpError}
              autoFocus
              editable={!loading}
            />
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>
                {t("profile.deleteAccount.otp.resendPrompt")}
              </Text>
              <Pressable
                onPress={() => void handleResend()}
                disabled={resendSeconds > 0 || loading}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendSeconds > 0 || loading) && styles.resendLinkDisabled,
                  ]}
                >
                  {t("profile.deleteAccount.otp.resend")}
                </Text>
              </Pressable>
            </View>
            {resendSeconds > 0 ? (
              <Text style={styles.countdown}>
                {t("profile.deleteAccount.otp.resendCountdown", {
                  time: formatCountdown(resendSeconds),
                })}
              </Text>
            ) : null}
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <View style={styles.footerActions}>
              <DeleteFooterButton
                label={t("profile.deleteAccount.otp.verifyCta")}
                variant="muted"
                disabled={!canVerify}
                loading={loading}
                onPress={() => void handleVerify()}
              />
              <DeleteFooterButton
                label={t("profile.edit.cancel")}
                variant="outline"
                disabled={loading}
                onPress={() => setStep("lastChance")}
              />
            </View>
          </>
        ) : null}

        {step === "deactivated" ? (
          <>
            <View style={styles.deactivatedCopy}>
              <Text style={styles.deactivatedTitle}>
                {t("profile.deleteAccount.deactivated.title")}
              </Text>
              <Text style={styles.deactivatedBody}>
                {t("profile.deleteAccount.deactivated.body")}
              </Text>
              <Text style={styles.deactivatedFooter}>
                {t("profile.deleteAccount.deactivated.footer")}
              </Text>
            </View>
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <View style={styles.footerActions}>
              <DeleteFooterButton
                label={t("profile.deleteAccount.deactivated.done")}
                variant="outlineBrand"
                onPress={() => void handleDone()}
              />
              <DeleteFooterButton
                label={t("profile.deleteAccount.deactivated.reactivate")}
                variant="primary"
                loading={loading}
                onPress={() => void handleReactivate()}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      {step !== "deactivated" ? <HomeTabBar activeTab="profile" /> : null}
    </SafeAreaView>
  );
}

type DeleteFooterButtonProps = {
  label: string;
  onPress: () => void;
  variant: "muted" | "outline" | "outlineBrand" | "primary";
  disabled?: boolean;
  loading?: boolean;
};

function DeleteFooterButton({
  label,
  onPress,
  variant,
  disabled = false,
  loading = false,
}: DeleteFooterButtonProps) {
  const styles = useThemedStyles(createFooterStyles);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && variant !== "primary" && styles.disabledMuted,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#1C1C1C" />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "muted" && isDisabled && styles.labelDisabled,
            variant === "muted" && !isDisabled && styles.labelActive,
            variant === "outline" && isDisabled && styles.labelDisabled,
            variant === "outline" && !isDisabled && styles.labelActive,
            variant === "outlineBrand" && styles.labelBrand,
            variant === "primary" && styles.labelPrimary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const createFooterStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    muted: {
      backgroundColor: "#E8E8E8",
    },
    outline: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: "#E8E8E8",
    },
    outlineBrand: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.brand,
    },
    primary: {
      backgroundColor: theme.colors.brand,
    },
    disabledMuted: {
      opacity: 1,
    },
    label: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: "#1C1C1C",
    },
    labelDisabled: {
      color: "#B9B9B9",
    },
    labelActive: {
      color: "#1C1C1C",
    },
    labelBrand: {
      color: theme.colors.brand,
    },
    labelPrimary: {
      color: "#181C21",
    },
    pressed: {
      opacity: 0.85,
    },
  });

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.groupsScreenBg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    intro: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#494949",
      textAlign: "center",
    },
    reasonList: {
      gap: 0,
    },
    reasonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 55,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: "#BBBCBC",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: "#BBBCBC",
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: theme.colors.surface,
    },
    reasonLabel: {
      flex: 1,
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 20,
      color: "#1C1C1C",
    },
    lastChanceCopy: {
      gap: theme.spacing.sm,
      alignItems: "center",
    },
    lastChanceLead: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: "#374B60",
      textAlign: "center",
    },
    lastChanceBody: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#374B60",
      textAlign: "center",
    },
    lastChanceQuestion: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#374B60",
      textAlign: "center",
    },
    otpCopy: {
      gap: 12,
    },
    otpTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: "#181C21",
    },
    otpBody: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#2C3138",
      textAlign: "center",
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    },
    resendPrompt: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: "#6D7888",
    },
    resendLink: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 20,
      color: theme.colors.brand,
    },
    resendLinkDisabled: {
      opacity: 0.5,
    },
    countdown: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#181C21",
    },
    deactivatedCopy: {
      alignItems: "center",
      gap: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },
    deactivatedTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 24,
      lineHeight: 28,
      color: "#1C1C1C",
      textAlign: "center",
    },
    deactivatedBody: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#494949",
      textAlign: "center",
    },
    deactivatedFooter: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#494949",
      textAlign: "center",
    },
    footerActions: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
