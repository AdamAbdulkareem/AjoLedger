import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthProvider";
import {
  GoogleSignInCancelledError,
  GoogleSignInNotAvailableError,
  GoogleSignInNotConfiguredError,
} from "../lib/googleSignIn";
import { localizeAuthApiError } from "../lib/localizeAuthApiError";
import type { AuthStatus } from "../models/auth";

export function useGoogleAuthFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const navigateAfterAuth = useCallback(
    (nextStatus: AuthStatus) => {
      router.replace(
        nextStatus === "needsPasscodeSetup"
          ? "/setup-access-passcode"
          : "/enter-access-passcode",
      );
    },
    [router],
  );

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    setSubmitting(true);

    try {
      const nextStatus = await loginWithGoogle();
      navigateAfterAuth(nextStatus);
      return null;
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        return null;
      }

      if (error instanceof GoogleSignInNotConfiguredError) {
        return t("auth.errors.googleNotConfigured");
      }

      if (error instanceof GoogleSignInNotAvailableError) {
        return t("auth.errors.googleRequiresDevBuild");
      }

      if (error instanceof ApiError) {
        return localizeAuthApiError(error, t);
      }

      if (error instanceof Error && error.message.trim()) {
        return t("auth.errors.generic");
      }

      return t("auth.errors.generic");
    } finally {
      setSubmitting(false);
    }
  }, [loginWithGoogle, navigateAfterAuth, t]);

  return {
    signInWithGoogle,
    submitting,
  };
}
