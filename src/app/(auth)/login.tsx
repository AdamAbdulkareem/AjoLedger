import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AuthScreenLayout } from "../../components/AuthScreenLayout";
import { Button } from "../../components/Button";
import { OrDivider } from "../../components/OrDivider";
import { SocialAuthButton } from "../../components/SocialAuthButton";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthProvider";
import { ApiError } from "../../api/client";
import { useGoogleAuthFlow } from "../../hooks/useGoogleAuthFlow";
import { isValidEmail, normalizeEmail } from "../../lib/authValidation";
import { useThemedStyles, type Theme } from "../../theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const { signInWithGoogle, submitting: googleSubmitting } = useGoogleAuthFlow();
  const styles = useThemedStyles(createStyles);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!isValidEmail(email)) {
      setEmailError(t("auth.errors.invalidEmail"));
      valid = false;
    }

    if (!password) {
      setPasswordError(t("auth.errors.passwordRequired"));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setFormError(undefined);

    try {
      const nextStatus = await login(normalizeEmail(email), password);
      router.replace(
        nextStatus === "needsPasscodeSetup"
          ? "/setup-access-passcode"
          : "/enter-access-passcode",
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t("auth.errors.generic");
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(undefined);
    const message = await signInWithGoogle();
    if (message) {
      setFormError(message);
    }
  };

  return (
    <AuthScreenLayout
      footer={
        <Text style={styles.footer}>
          {t("auth.noAccount")}{" "}
          <Link href="/register" style={styles.footerLink}>
            {t("auth.signUp")}
          </Link>
        </Text>
      }
    >
      <Text style={styles.title}>{t("auth.loginTitle")}</Text>

      <View style={styles.form}>
        <TextField
          label={t("auth.emailLabel")}
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.emailPlaceholder")}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          autoComplete="email"
        />
        <TextField
          label={t("auth.passwordLabel")}
          value={password}
          onChangeText={setPassword}
          placeholder={t("auth.passwordPlaceholder")}
          error={passwordError}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
        />
      </View>

      {formError ? (
        <Text style={styles.formError} accessibilityLiveRegion="polite">
          {formError}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={t("auth.logIn")}
          onPress={handleSubmit}
          loading={submitting}
          disabled={googleSubmitting}
        />
        <OrDivider label={t("auth.or")} />
        <View style={styles.social}>
          <SocialAuthButton
            provider="google"
            onGooglePress={() => void handleGoogleSignIn()}
            googleLoading={googleSubmitting}
            disabled={submitting}
          />
          <SocialAuthButton provider="apple" />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      ...theme.typography.title,
      color: theme.colors.textPrimary,
    },
    form: {
      gap: theme.spacing.lg,
    },
    actions: {
      gap: theme.spacing.lg,
    },
    social: {
      gap: theme.spacing.sm + 4,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    footer: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: theme.spacing.lg,
    },
    footerLink: {
      color: theme.colors.link,
      fontFamily: theme.fontFamily.semibold,
    },
  });
