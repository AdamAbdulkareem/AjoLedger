import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { TextField } from "../TextField";
import { ContributionFrequencyPicker } from "./ContributionFrequencyPicker";
import type { ContributionFrequency } from "../../models/group";
import type { CreateGroupFieldErrors } from "../../lib/groupValidation";
import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type CreateGroupFormProps = {
  name: string;
  description: string;
  frequency: ContributionFrequency;
  contributionAmount: string;
  numberOfParticipants: string;
  fieldErrors: CreateGroupFieldErrors;
  formError?: string;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFrequencyChange: (value: ContributionFrequency) => void;
  onContributionAmountChange: (value: string) => void;
  onNumberOfParticipantsChange: (value: string) => void;
  onSubmit: () => void;
};

export function CreateGroupForm({
  name,
  description,
  frequency,
  contributionAmount,
  numberOfParticipants,
  fieldErrors,
  formError,
  submitting,
  onNameChange,
  onDescriptionChange,
  onFrequencyChange,
  onContributionAmountChange,
  onNumberOfParticipantsChange,
  onSubmit,
}: CreateGroupFormProps) {
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

      <View style={styles.form}>
        <TextField
          label={t("groups.create.nameLabel")}
          value={name}
          onChangeText={onNameChange}
          placeholder={t("groups.create.namePlaceholder")}
          error={fieldErrors.name}
          autoCapitalize="words"
        />

        <TextField
          label={t("groups.create.descriptionLabel")}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder={t("groups.create.descriptionPlaceholder")}
          error={fieldErrors.description}
          autoCapitalize="sentences"
        />

        <ContributionFrequencyPicker
          label={t("groups.create.frequencyLabel")}
          value={frequency}
          onChange={onFrequencyChange}
        />

        <TextField
          label={t("groups.create.amountLabel")}
          value={contributionAmount}
          onChangeText={onContributionAmountChange}
          placeholder={t("groups.create.amountPlaceholder")}
          error={fieldErrors.contributionAmount}
          keyboardType="number-pad"
        />

        <TextField
          label={t("groups.create.participantsLabel")}
          value={numberOfParticipants}
          onChangeText={onNumberOfParticipantsChange}
          placeholder={t("groups.create.participantsPlaceholder")}
          error={fieldErrors.numberOfParticipants}
          keyboardType="number-pad"
        />
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Button
        label={t("groups.create.submit")}
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
    form: {
      gap: theme.spacing.md,
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
