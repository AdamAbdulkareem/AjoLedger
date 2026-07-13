import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trans, useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../components/Button";
import { useThemedStyles, type Theme } from "../../theme";

export default function SupportConfirmationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { email } = useLocalSearchParams<{ email?: string }>();

  const replyEmail = typeof email === "string" ? email : "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark" size={40} color="#15803D" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{t("support.confirmation.title")}</Text>
        <Text style={styles.body}>
          <Trans
            i18nKey="support.confirmation.body"
            values={{ email: replyEmail }}
            components={{
              highlight: <Text style={styles.emailHighlight} />,
            }}
          />
        </Text>

        <Button
          label={t("support.confirmation.done")}
          onPress={() => router.replace("/(app)/contact-support")}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.groupsScreenBg,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.lg,
      alignItems: "center",
    },
    iconWrap: {
      marginBottom: theme.spacing.sm,
    },
    iconOuter: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
    },
    iconInner: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "#BBF7D0",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 24,
      lineHeight: 28,
      color: "#1C1C1C",
      textAlign: "center",
    },
    body: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: "#181C21",
      textAlign: "center",
    },
    emailHighlight: {
      color: theme.colors.brand,
    },
  });
