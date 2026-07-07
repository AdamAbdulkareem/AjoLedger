import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { TextField } from "../TextField";
import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type EnterInviteCodeFormProps = {
  inviteCode: string;
  codeError?: string;
  formError?: string;
  submitting: boolean;
  onInviteCodeChange: (value: string) => void;
  onSubmit: () => void;
};

export function EnterInviteCodeForm({
  inviteCode,
  codeError,
  formError,
  submitting,
  onInviteCodeChange,
  onSubmit,
}: EnterInviteCodeFormProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={LOGO_MARK}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>

      <Text style={styles.subtitle}>{t("groups.join.subtitle")}</Text>

      <TextField
        label={t("groups.join.codeLabel")}
        value={inviteCode}
        onChangeText={onInviteCodeChange}
        placeholder={t("groups.join.codePlaceholder")}
        error={codeError}
        autoCapitalize="characters"
      />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Button
        label={t("groups.join.submit")}
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting}
        size="compact"
        style={styles.submitButton}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    logoWrap: {
      alignItems: "center",
    },
    logo: {
      width: 50,
      height: 50,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: theme.spacing.sm,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    submitButton: {
      alignSelf: "center",
      minWidth: 283,
    },
  });
