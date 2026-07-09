import { useState, useCallback, useRef, useEffect } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasscodeRowInput } from "../components/AccessPasscodeInput";
import { ACCESS_PASSCODE_LENGTH } from "../lib/accessPasscodeStorage";
import { Button } from "../components/Button";
import { FormSubmittingIndicator } from "../components/FormSubmittingIndicator";
import { AjoLedgerLogo } from "../components/AjoLedgerLogo";
import { PasscodeUserBadge } from "../components/PasscodeUserBadge";
import { useAuth } from "../context/AuthProvider";
import { useProfile } from "../context/ProfileProvider";
import { ApiError } from "../api/client";
import {
  BIOMETRIC_NOT_ENROLLED,
  INCORRECT_ACCESS_PASSCODE,
  PASSCODE_LOCKED_OUT,
} from "../models/auth";
import {
  getBiometricUnlockLabelKey,
  loadBiometricStatus,
  type BiometricCapabilities,
} from "../lib/biometricAuth";
import {
  getPasscodeLockoutStatus,
  type PasscodeLockoutStatus,
} from "../lib/passcodeLockout";
import { waitForNextFrame } from "../lib/waitForNextFrame";
import { useTheme, useThemedStyles, type Theme } from "../theme";

function getLockoutRemainingSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.message !== PASSCODE_LOCKED_OUT) {
    return null;
  }
  const remaining = error.meta?.remainingSeconds;
  return typeof remaining === "number" ? remaining : null;
}

export default function EnterAccessPasscodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { status, user, verifyAccessPasscode, unlockWithBiometrics, logout } =
    useAuth();
  const { profile } = useProfile();
  const styles = useThemedStyles(createStyles);

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [biometricCaps, setBiometricCaps] = useState<BiometricCapabilities | null>(
    null,
  );
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricUnlocking, setBiometricUnlocking] = useState(false);
  const [lockout, setLockout] = useState<PasscodeLockoutStatus | null>(null);

  const isLockedOut = (lockout?.locked ?? false) || (lockout?.remainingSeconds ?? 0) > 0;
  const isFormValid =
    passcode.length === ACCESS_PASSCODE_LENGTH && !isLockedOut;

  const refreshLockout = useCallback(async () => {
    if (!user) {
      setLockout(null);
      return;
    }

    const nextLockout = await getPasscodeLockoutStatus(user.id);
    setLockout(nextLockout);
    if (nextLockout.locked) {
      setFormError(
        t("auth.errors.passcodeLockedOut", {
          seconds: nextLockout.remainingSeconds,
        }),
      );
    }
  }, [user, t]);

  useFocusEffect(
    useCallback(() => {
      void refreshLockout();
    }, [refreshLockout]),
  );

  useEffect(() => {
    if (!user || !isLockedOut) return;

    const intervalId = setInterval(() => {
      void refreshLockout();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [user, isLockedOut, refreshLockout]);

  const handleBiometricUnlock = useCallback(
    async (silentFailure = false) => {
      if (biometricUnlocking || submitting || isLockedOut) return;
      if (!silentFailure && !biometricsEnabled) return;

      setBiometricUnlocking(true);
      if (!silentFailure) {
        setFormError(undefined);
      }

      try {
        await unlockWithBiometrics({
          promptMessage: t("auth.biometricPrompt"),
          silentFailure,
        });
        router.replace("/(app)/home");
      } catch (error) {
        if (silentFailure) return;

        if (error instanceof ApiError && error.message === BIOMETRIC_NOT_ENROLLED) {
          Alert.alert(
            t("profile.biometrics.notEnrolledTitle"),
            t("profile.biometrics.notEnrolledBody"),
          );
          return;
        }

        const message =
          error instanceof ApiError ? error.message : t("auth.errors.generic");
        setFormError(message);
      } finally {
        setBiometricUnlocking(false);
      }
    },
    [
      biometricUnlocking,
      submitting,
      isLockedOut,
      biometricsEnabled,
      unlockWithBiometrics,
      router,
      t,
    ],
  );

  const handleBiometricUnlockRef = useRef(handleBiometricUnlock);
  handleBiometricUnlockRef.current = handleBiometricUnlock;

  useFocusEffect(
    useCallback(() => {
      if (!user || Platform.OS === "web") return;

      let cancelled = false;

      void (async () => {
        const biometricStatus = await loadBiometricStatus(user.id);
        if (cancelled || !biometricStatus) return;

        setBiometricsEnabledState(biometricStatus.enabled);
        setBiometricCaps(biometricStatus.caps);

        if (
          !biometricStatus.enabled ||
          !biometricStatus.caps.available ||
          !biometricStatus.caps.enrolled
        ) {
          return;
        }

        await handleBiometricUnlockRef.current(true);
      })();

      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  const handleSubmit = async (code?: string) => {
    if (submitting || isLockedOut) return;

    const value = code ?? passcode;
    setPasscodeError(undefined);
    setFormError(undefined);

    if (value.length !== ACCESS_PASSCODE_LENGTH) {
      setPasscodeError(t("auth.errors.accessPasscodeLength"));
      return;
    }

    setSubmitting(true);

    try {
      await waitForNextFrame();
      await verifyAccessPasscode(value);
      router.replace("/(app)/home");
    } catch (error) {
      const lockoutSeconds = getLockoutRemainingSeconds(error);
      if (lockoutSeconds !== null) {
        setFormError(
          t("auth.errors.passcodeLockedOut", { seconds: lockoutSeconds }),
        );
        void refreshLockout();
        return;
      }

      const message =
        error instanceof ApiError &&
        error.message === INCORRECT_ACCESS_PASSCODE
          ? t("auth.errors.incorrectAccessPasscode")
          : error instanceof ApiError
            ? error.message
            : t("auth.errors.generic");
      setFormError(message);
      void refreshLockout();
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "booting") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  if (status === "needsPasscodeSetup") {
    return <Redirect href="/setup-access-passcode" />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(app)/home" />;
  }

  const handleForgetPasscode = () => {
    Alert.alert(
      t("auth.forgetPasscodeTitle"),
      t("auth.forgetPasscodeBody"),
      [
        { text: t("auth.forgetPasscodeCancel"), style: "cancel" },
        {
          text: t("auth.forgetPasscodeConfirm"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await logout();
                router.replace("/login");
              } catch (error) {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : t("auth.errors.generic");
                Alert.alert(t("auth.errors.generic"), message);
              }
            })();
          },
        },
      ],
    );
  };

  const handleSwitchAccount = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t("auth.errors.generic");
      Alert.alert(t("auth.errors.generic"), message);
    }
  };

  const handleFingerprint = () => {
    void handleBiometricUnlock(false);
  };

  const showBiometricLogin =
    biometricsEnabled &&
    biometricCaps?.available === true &&
    biometricCaps.enrolled === true;

  const biometricUnlockLabelKey = biometricCaps
    ? getBiometricUnlockLabelKey(biometricCaps.kind)
    : "auth.unlockWithBiometrics";

  return (
    <SafeAreaView style={styles.container}>
      <AjoLedgerLogo style={styles.logo} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <PasscodeUserBadge
            email={user.email}
            avatarUri={profile?.avatarUri}
          />
        ) : null}

        <View style={styles.form}>
          <PasscodeRowInput
            placeholder={t("auth.enterPasscodePlaceholder")}
            value={passcode}
            onChangeText={setPasscode}
            error={passcodeError}
            editable={!submitting && !biometricUnlocking && !isLockedOut}
            onComplete={(code) => {
              void handleSubmit(code);
            }}
          />
          <FormSubmittingIndicator
            message={
              biometricUnlocking
                ? t("auth.submittingBiometric")
                : t("auth.submittingPasscode")
            }
            visible={submitting || biometricUnlocking}
          />
          <Pressable
            onPress={handleForgetPasscode}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t("auth.forgetPasscode")}
            style={styles.forgetLinkWrap}
          >
            <Text style={styles.forgetLink}>{t("auth.forgetPasscode")}</Text>
          </Pressable>
        </View>

        {formError ? (
          <Text style={styles.formError} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}

        <Button
          label={t("auth.logIn")}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={!isFormValid}
          loading={submitting || biometricUnlocking}
          size="compact"
          style={{ backgroundColor: theme.colors.activityPayoutBg }}
        />

        <View style={styles.footerLinks}>
          <Pressable
            onPress={() => {
              void handleSwitchAccount();
            }}
            accessibilityRole="button"
            accessibilityLabel={t("auth.switchAccount")}
          >
            <Text style={styles.footerLink}>{t("auth.switchAccount")}</Text>
          </Pressable>
          {showBiometricLogin ? (
            <>
              <Text style={styles.footerDivider}>|</Text>
              <Pressable
                onPress={handleFingerprint}
                disabled={biometricUnlocking || submitting || isLockedOut}
                accessibilityRole="button"
                accessibilityLabel={t(biometricUnlockLabelKey)}
              >
                <Text style={styles.footerLink}>{t(biometricUnlockLabelKey)}</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    logo: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xl + theme.spacing.md,
      gap: theme.spacing.lg,
    },
    form: {
      gap: theme.spacing.sm + 3,
    },
    forgetLinkWrap: {
      alignSelf: "stretch",
    },
    forgetLink: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
      textAlign: "right",
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    footerLink: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
    },
    footerDivider: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
  });
