import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/Button";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { SupportFormField } from "../../components/support/SupportFormField";
import { SupportTextArea } from "../../components/support/SupportTextArea";
import { useCurrentUser } from "../../context/CurrentUserProvider";
import { isValidEmail } from "../../lib/authValidation";
import { useThemedStyles, type Theme } from "../../theme";

export default function SupportMessageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { email: profileEmail } = useCurrentUser();

  const [email, setEmail] = useState(profileEmail);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [messageError, setMessageError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setEmailError(undefined);
    setMessageError(undefined);

    let valid = true;
    if (!isValidEmail(email.trim())) {
      setEmailError(t("support.form.errors.invalidEmail"));
      valid = false;
    }
    if (!message.trim()) {
      setMessageError(t("support.form.errors.messageRequired"));
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    router.push({
      pathname: "/(app)/support-confirmation",
      params: { email: email.trim() },
    });
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("support.message.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <SupportFormField
            label={t("support.form.emailLabel")}
            value={email}
            onChangeText={setEmail}
            placeholder={t("support.form.emailPlaceholder")}
            keyboardType="email-address"
            error={emailError}
          />
          <SupportTextArea
            label={t("support.form.messageLabel")}
            value={message}
            onChangeText={setMessage}
            placeholder={t("support.form.messagePlaceholder")}
            error={messageError}
          />
        </View>

        <Button
          label={t("support.form.send")}
          onPress={() => void handleSubmit()}
          loading={submitting}
        />
      </ScrollView>

      <HomeTabBar activeTab="profile" />
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
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.lg,
    },
  });
