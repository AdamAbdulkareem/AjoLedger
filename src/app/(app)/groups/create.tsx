import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { CreateGroupForm } from "../../../components/groups/CreateGroupForm";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { ApiError } from "../../../api/client";
import { createGroup } from "../../../api/groups";
import { useAuth } from "../../../context/AuthProvider";
import { rememberCreatorGroup } from "../../../lib/creatorGroupsStorage";
import { rememberGroupMetadata } from "../../../lib/groupMetadataStorage";
import {
  parsePositiveInteger,
  validateCreateGroupForm,
  type CreateGroupFieldErrors,
} from "../../../lib/groupValidation";
import type { ContributionFrequency } from "../../../models/group";
import { useThemedStyles, type Theme } from "../../../theme";

export default function CreateGroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<ContributionFrequency>("MONTHLY");
  const [contributionAmount, setContributionAmount] = useState("");
  const [numberOfParticipants, setNumberOfParticipants] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CreateGroupFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(undefined);
  }, []);

  const handleSubmit = useCallback(async () => {
    clearErrors();

    const validationErrors = validateCreateGroupForm(
      {
        name,
        description,
        frequency,
        contributionAmount,
        numberOfParticipants,
      },
      {
        nameRequired: t("groups.create.errors.nameRequired"),
        nameLength: t("groups.create.errors.nameLength"),
        descriptionLength: t("groups.create.errors.descriptionLength"),
        amountRequired: t("groups.create.errors.amountRequired"),
        amountMinimum: t("groups.create.errors.amountMinimum"),
        participantsRequired: t("groups.create.errors.participantsRequired"),
        participantsMinimum: t("groups.create.errors.participantsMinimum"),
      },
    );

    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    if (!accessToken) {
      setFormError(t("home.errors.generic"));
      return;
    }

    const parsedAmount = parsePositiveInteger(contributionAmount)!;
    const parsedParticipants = parsePositiveInteger(numberOfParticipants)!;

    setSubmitting(true);

    try {
      const created = await createGroup(accessToken, {
          name: name.trim(),
          description: description.trim() || undefined,
          frequency,
          contributionAmount: parsedAmount,
          numberOfParticipants: parsedParticipants,
        });

      await rememberCreatorGroup(created.id);
      await rememberGroupMetadata(created.id, {
        numberOfParticipants: parsedParticipants,
      });

      router.replace({
        pathname: "/(app)/groups/invite",
        params: { groupId: created.id },
      });
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : t("home.errors.generic"),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    accessToken,
    clearErrors,
    contributionAmount,
    description,
    frequency,
    name,
    numberOfParticipants,
    router,
    t,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.create.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CreateGroupForm
          name={name}
          description={description}
          frequency={frequency}
          contributionAmount={contributionAmount}
          numberOfParticipants={numberOfParticipants}
          fieldErrors={fieldErrors}
          formError={formError}
          submitting={submitting}
          onNameChange={(value) => {
            setName(value);
            setFieldErrors((current) => ({ ...current, name: undefined }));
            setFormError(undefined);
          }}
          onDescriptionChange={(value) => {
            setDescription(value);
            setFieldErrors((current) => ({ ...current, description: undefined }));
            setFormError(undefined);
          }}
          onFrequencyChange={setFrequency}
          onContributionAmountChange={(value) => {
            setContributionAmount(value);
            setFieldErrors((current) => ({
              ...current,
              contributionAmount: undefined,
            }));
            setFormError(undefined);
          }}
          onNumberOfParticipantsChange={(value) => {
            setNumberOfParticipants(value);
            setFieldErrors((current) => ({
              ...current,
              numberOfParticipants: undefined,
            }));
            setFormError(undefined);
          }}
          onSubmit={() => void handleSubmit()}
        />
      </ScrollView>
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
  });
