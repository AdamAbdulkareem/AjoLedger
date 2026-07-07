import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { EnterInviteCodeForm } from "../../../components/groups/EnterInviteCodeForm";
import { SubScreenHeader } from "../../../components/profile/SubScreenHeader";
import { ApiError } from "../../../api/client";
import { getGroupDetails, joinGroup } from "../../../api/groups";
import { useAuth } from "../../../context/AuthProvider";
import {
  normalizeInviteCode,
  validateInviteCode,
} from "../../../lib/groupValidation";
import { useThemedStyles, type Theme } from "../../../theme";

export default function JoinGroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { accessToken } = useAuth();

  const [inviteCode, setInviteCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    setCodeError(undefined);
    setFormError(undefined);

    const validationError = validateInviteCode(inviteCode, {
      required: t("groups.join.errors.required"),
      invalid: t("groups.join.errors.invalid"),
    });

    if (validationError) {
      setCodeError(validationError);
      return;
    }

    if (!accessToken) {
      setFormError(t("home.errors.generic"));
      return;
    }

    const normalizedCode = normalizeInviteCode(inviteCode);
    setSubmitting(true);

    try {
      const result = await joinGroup(accessToken, {
        inviteCode: normalizedCode,
      });

      let joinedGroupName = "";
      try {
        const details = await getGroupDetails(accessToken, result.groupId);
        joinedGroupName = details.name;
      } catch {
        joinedGroupName = "";
      }

      router.replace({
        pathname: "/(app)/groups",
        params: joinedGroupName ? { joinedGroupName } : undefined,
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
  }, [accessToken, inviteCode, router, t]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("groups.join.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EnterInviteCodeForm
          inviteCode={inviteCode}
          codeError={codeError}
          formError={formError}
          submitting={submitting}
          onInviteCodeChange={(value) => {
            setInviteCode(value.toUpperCase());
            setCodeError(undefined);
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
