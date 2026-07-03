import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { HomeTabBar } from "../../components/home/HomeTabBar";
import { ProfilePhotoEditor } from "../../components/profile/ProfilePhotoEditor";
import { SubScreenHeader } from "../../components/profile/SubScreenHeader";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthProvider";
import { useProfile } from "../../context/ProfileProvider";
import { useEditProfilePictureModal } from "../../hooks/useEditProfilePictureModal";
import { deriveDisplayName } from "../../lib/greeting";
import {
  normalizePhoneNumber,
  validateProfileForm,
} from "../../lib/profileValidation";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const { profile, loading, saving, updateProfile } = useProfile();
  const photoModal = useEditProfilePictureModal();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullNameError, setFullNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [phoneError, setPhoneError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    if (!profile || !user) return;
    setFullName(profile.fullName);
    setEmail(user.email);
    setPhoneNumber(profile.phoneNumber);
  }, [profile, user]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    setFullNameError(undefined);
    setEmailError(undefined);
    setPhoneError(undefined);
    setFormError(undefined);

    const validation = validateProfileForm({ fullName, email, phoneNumber });
    if (!validation.valid) {
      if (validation.fullNameError) {
        setFullNameError(t("profile.edit.errors.fullNameRequired"));
      }
      if (validation.emailError) {
        setEmailError(t("profile.edit.errors.invalidEmail"));
      }
      if (validation.phoneError) {
        setPhoneError(t("profile.edit.errors.invalidPhone"));
      }
      return;
    }

    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: normalizePhoneNumber(phoneNumber),
      });
      router.back();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : t("home.errors.generic"),
      );
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <SubScreenHeader title={t("profile.edit.title")} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
        <HomeTabBar activeTab="profile" />
      </SafeAreaView>
    );
  }

  const fallbackName = deriveDisplayName(user?.email) ?? t("profile.defaultName");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SubScreenHeader title={t("profile.edit.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProfilePhotoEditor
          avatarUri={photoModal.avatarUri}
          onEditPhotoPress={photoModal.open}
          showChangePhotoLabel
        />

        <View style={styles.form}>
          <TextField
            label={t("profile.edit.fullNameLabel")}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setFullNameError(undefined);
              setFormError(undefined);
            }}
            placeholder={profile?.fullName ?? fallbackName}
            error={fullNameError}
            autoCapitalize="words"
            textContentType="name"
          />

          <TextField
            label={t("profile.edit.emailLabel")}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(undefined);
              setFormError(undefined);
            }}
            placeholder={user?.email}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
          />

          <TextField
            label={t("profile.edit.phoneLabel")}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(normalizePhoneNumber(text));
              setPhoneError(undefined);
              setFormError(undefined);
            }}
            placeholder={t("profile.edit.phonePlaceholder")}
            error={phoneError}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
          />
        </View>

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <View style={styles.actions}>
          <Button
            label={t("profile.edit.saveChanges")}
            onPress={() => void handleSave()}
            disabled={saving}
          />
          <Pressable
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel={t("profile.edit.cancel")}
            disabled={saving}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressed,
              saving && styles.disabled,
            ]}
          >
            <Text style={styles.cancelLabel}>{t("profile.edit.cancel")}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <HomeTabBar activeTab="profile" />
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
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.md,
    },
    formError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
    actions: {
      gap: theme.spacing.md,
    },
    cancelButton: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    cancelLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
      color: theme.colors.brand,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
  });
