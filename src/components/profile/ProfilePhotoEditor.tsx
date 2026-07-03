import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { resolveAvatarSource } from "../../lib/avatarSource";
import { useThemedStyles, type Theme } from "../../theme";

type ProfilePhotoEditorProps = {
  avatarUri?: string | null;
  onEditPhotoPress?: () => void;
  showChangePhotoLabel?: boolean;
};

export function ProfilePhotoEditor({
  avatarUri,
  onEditPhotoPress,
  showChangePhotoLabel = false,
}: ProfilePhotoEditorProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image
          source={resolveAvatarSource(avatarUri)}
          style={styles.avatar}
          accessibilityLabel={t("profile.editPhoto.title")}
        />
        <Pressable
          onPress={onEditPhotoPress}
          accessibilityRole="button"
          accessibilityLabel={t("profile.editPhoto.title")}
          style={({ pressed }) => [styles.cameraBadge, pressed && styles.pressed]}
        >
          <Ionicons name="camera-outline" size={16} color="#2C3138" />
        </Pressable>
      </View>
      {showChangePhotoLabel ? (
        <Pressable
          onPress={onEditPhotoPress}
          accessibilityRole="button"
          accessibilityLabel={t("profile.edit.changePhoto")}
        >
          <Text style={styles.changePhoto}>{t("profile.edit.changePhoto")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: theme.spacing.md,
    },
    avatarWrap: {
      width: 79,
      height: 70,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
    cameraBadge: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    changePhoto: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "500",
      color: "#1C1C1C",
      textAlign: "center",
    },
    pressed: {
      opacity: 0.85,
    },
  });
