import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { HomeTabBar } from "../../components/home/HomeTabBar";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import {
  SUPPORT_PHONE_DIAL,
  SUPPORT_PHONE_DISPLAY,
} from "../../lib/supportContact";
import { useThemedStyles, type Theme } from "../../theme";

export default function SupportPhoneScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const handleCall = () => {
    void Linking.openURL(`tel:${SUPPORT_PHONE_DIAL}`).catch(() => {
      Alert.alert(
        t("support.phone.callFailedTitle"),
        t("support.phone.callFailedBody"),
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("support.phone.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("support.phone.supportLine")}</Text>
          <Text style={styles.phoneNumber}>{SUPPORT_PHONE_DISPLAY}</Text>
          <Pressable
            onPress={handleCall}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonLabel}>{t("support.phone.callNow")}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("support.phone.salesLine")}</Text>
          <Text style={styles.phoneNumber}>{SUPPORT_PHONE_DISPLAY}</Text>
          <Pressable
            onPress={handleCall}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.outlineButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.outlineButtonLabel}>{t("support.phone.callNow")}</Text>
          </Pressable>
        </View>

        <View style={styles.hoursCard}>
          <Text style={styles.hoursTitle}>{t("support.phone.hoursTitle")}</Text>
          <Text style={styles.hoursLine}>{t("support.phone.weekdayHours")}</Text>
          <Text style={styles.hoursLine}>{t("support.phone.weekendHours")}</Text>
        </View>
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
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: "#FCFCFC",
      borderWidth: 1,
      borderColor: "#E6F1F4",
      borderRadius: 12,
      padding: 20,
      gap: 20,
    },
    cardLabel: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: "#676767",
    },
    phoneNumber: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 24,
      color: "#1C1C1C",
    },
    primaryButton: {
      minHeight: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    primaryButtonLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 24,
      color: "#2C3138",
    },
    outlineButton: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    outlineButtonLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.brand,
    },
    hoursCard: {
      backgroundColor: theme.colors.carouselCardBg,
      borderWidth: 0.5,
      borderColor: theme.colors.brand,
      borderRadius: 12,
      padding: theme.spacing.md,
      gap: 12,
    },
    hoursTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: "#1C1C1C",
    },
    hoursLine: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
      color: "#494949",
    },
    pressed: {
      opacity: 0.85,
    },
  });
