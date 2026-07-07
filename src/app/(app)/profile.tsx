import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

import { BankDetailsModal } from "../../components/home/BankDetailsModal";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { ProfileAvatarSection } from "../../components/profile/ProfileAvatarSection";
import { ProfileMenuRow } from "../../components/profile/ProfileMenuRow";
import { ProfileScreenHeader } from "../../components/profile/ProfileScreenHeader";
import { ProfileSection } from "../../components/profile/ProfileSection";
import { ProfileSuccessToast } from "../../components/profile/ProfileSuccessToast";
import { useAuth } from "../../context/AuthProvider";
import { useCurrentUser } from "../../context/CurrentUserProvider";
import { useProfile } from "../../context/ProfileProvider";
import { usePayoutAccountGate } from "../../hooks/usePayoutAccountGate";
import { useEditProfilePictureModal } from "../../hooks/useEditProfilePictureModal";
import { setStoredLanguage } from "../../i18n/languageStorage";
import { getLanguageLabel } from "../../i18n/languages";
import { showLanguagePicker } from "../../lib/showLanguagePicker";
import {
  getBiometricProfileLabelKey,
  loadBiometricStatus,
  promptBiometricAuth,
  type BiometricCapabilities,
} from "../../lib/biometricAuth";
import { setBiometricsEnabled } from "../../lib/biometricStorage";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, accessToken, logout } = useAuth();
  const { displayName, email } = useCurrentUser();
  const { profile, pendingUpdateSuccess, consumePendingUpdateSuccess } =
    useProfile();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const photoModal = useEditProfilePictureModal();

  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  const resolvedDisplayName = displayName || t("profile.defaultName");

  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricCaps, setBiometricCaps] = useState<BiometricCapabilities | null>(
    null,
  );
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  const {
    account,
    saving: savingPayoutAccount,
    error: payoutAccountError,
    clearError,
  } = usePayoutAccountGate();

  const showComingSoon = useCallback(() => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      if (!pendingUpdateSuccess) return;
      setShowUpdateSuccess(true);
      consumePendingUpdateSuccess();
    }, [pendingUpdateSuccess, consumePendingUpdateSuccess]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!user || Platform.OS === "web") return;

      let cancelled = false;

      void (async () => {
        const status = await loadBiometricStatus(user.id);
        if (cancelled || !status) return;

        setBiometricsEnabledState(status.enabled);
        setBiometricCaps(status.caps);
      })();

      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  const handleBiometricsToggle = useCallback(
    async (nextValue: boolean) => {
      if (!user || biometricsLoading) return;

      if (!nextValue) {
        const saved = await setBiometricsEnabled(user.id, false);
        if (saved) {
          setBiometricsEnabledState(false);
        } else {
          Alert.alert(t("home.errors.generic"));
        }
        return;
      }

      if (!biometricCaps?.available) {
        Alert.alert(
          t("profile.biometrics.notAvailableTitle"),
          t("profile.biometrics.notAvailableBody"),
        );
        return;
      }

      if (!biometricCaps.enrolled) {
        Alert.alert(
          t("profile.biometrics.notEnrolledTitle"),
          t("profile.biometrics.notEnrolledBody"),
        );
        return;
      }

      setBiometricsLoading(true);

      try {
        const result = await promptBiometricAuth(
          t("profile.biometrics.enablePrompt"),
        );

        if (!result.success) {
          if (!result.cancelled && result.error === "not_enrolled") {
            Alert.alert(
              t("profile.biometrics.notEnrolledTitle"),
              t("profile.biometrics.notEnrolledBody"),
            );
          }
          return;
        }

        const saved = await setBiometricsEnabled(user.id, true);
        if (saved) {
          setBiometricsEnabledState(true);
        } else {
          Alert.alert(t("home.errors.generic"));
        }
      } finally {
        setBiometricsLoading(false);
      }
    },
    [user, biometricsLoading, biometricCaps, t],
  );

  const biometricLabelKey = biometricCaps
    ? getBiometricProfileLabelKey(biometricCaps.kind)
    : "profile.rows.biometrics";

  const showBiometricsRow =
    Platform.OS !== "web" && biometricCaps?.available === true;

  const handleLanguagePress = () => {
    showLanguagePicker({
      t,
      currentLanguage: i18n.language,
      onSelect: (code) => {
        void setStoredLanguage(code);
        void i18n.changeLanguage(code);
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logoutTitle"), t("profile.logoutMessage"), [
      { text: t("profile.logoutCancel"), style: "cancel" },
      {
        text: t("profile.logoutConfirm"),
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  };

  const languageLabel = getLanguageLabel(i18n.language);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ProfileScreenHeader title={t("profile.title")} />

      <ProfileSuccessToast
        message={t("profile.edit.successMessage")}
        visible={showUpdateSuccess}
        onDismiss={() => setShowUpdateSuccess(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileAvatarSection
          displayName={resolvedDisplayName}
          email={email}
          avatarUri={photoModal.avatarUri}
          onEditPhotoPress={photoModal.open}
        />

        <View style={styles.sections}>
          <ProfileSection title={t("profile.sections.account")}>
            <ProfileMenuRow
              icon={<Ionicons name="person-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.editProfile")}
              showChevron
              onPress={() => router.push("/(app)/edit-profile")}
            />
          </ProfileSection>

          <ProfileSection title={t("profile.sections.security")}>
            <ProfileMenuRow
              icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.changePassword")}
              showChevron
              onPress={showComingSoon}
            />
            {showBiometricsRow ? (
              <ProfileMenuRow
                icon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textPrimary} />}
                label={t(biometricLabelKey)}
                toggleValue={biometricsEnabled}
                onToggleChange={(value) => {
                  void handleBiometricsToggle(value);
                }}
                toggleDisabled={biometricsLoading}
              />
            ) : null}
            <ProfileMenuRow
              icon={<Ionicons name="eye-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.privacyPolicy")}
              showChevron
              onPress={showComingSoon}
            />
            <ProfileMenuRow
              icon={<Ionicons name="card-outline" size={20} color={theme.colors.bankMenuIcon} />}
              label={t("profile.rows.bankDetails")}
              showChevron
              onPress={() => setBankModalVisible(true)}
            />
          </ProfileSection>

          <ProfileSection title={t("profile.sections.preferences")}>
            <ProfileMenuRow
              icon={<Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.pushNotifications")}
              toggleValue={pushEnabled}
              onToggleChange={setPushEnabled}
            />
            <ProfileMenuRow
              icon={<Ionicons name="language-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.language")}
              showChevron
              onPress={handleLanguagePress}
              trailing={
                <Text style={styles.languageValue}>{languageLabel}</Text>
              }
            />
          </ProfileSection>

          <ProfileSection
            title={t("profile.sections.helpSupport")}
            titleStyle="subtitle"
          >
            <ProfileMenuRow
              icon={<Ionicons name="help-circle-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.faq")}
              showChevron
              onPress={showComingSoon}
            />
            <ProfileMenuRow
              icon={<Ionicons name="call-outline" size={20} color={theme.colors.textPrimary} />}
              label={t("profile.rows.contactSupport")}
              showChevron
              onPress={showComingSoon}
            />
          </ProfileSection>
        </View>

        <ProfileMenuRow
          icon={<Ionicons name="trash-outline" size={20} color={theme.colors.textPrimary} />}
          label={t("profile.rows.deleteAccount")}
          showChevron
          onPress={showComingSoon}
        />

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t("profile.logoutConfirm")}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.logoutText}>{t("profile.logoutConfirm")}</Text>
        </Pressable>
      </ScrollView>

      <HomeTabBar activeTab="profile" />

      <BankDetailsModal
        visible={bankModalVisible}
        accessToken={accessToken}
        saving={savingPayoutAccount}
        error={payoutAccountError}
        onSubmit={async () => "failed" as const}
        onClearError={clearError}
        dismissible
        onClose={() => setBankModalVisible(false)}
        initialAccount={account}
        variant="profile"
      />

      {photoModal.modal}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    sections: {
      gap: theme.spacing.lg,
    },
    languageValue: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    logoutButton: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    logoutText: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "500",
      color: theme.colors.amountDue,
    },
    pressed: {
      opacity: 0.85,
    },
  });
