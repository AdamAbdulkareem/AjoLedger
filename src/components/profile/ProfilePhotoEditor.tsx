import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AvatarWithEditBadge } from "./AvatarWithEditBadge";
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
      <AvatarWithEditBadge
        avatarUri={avatarUri}
        imageAccessibilityLabel={t("profile.editPhoto.title")}
        editAccessibilityLabel={t("profile.editPhoto.title")}
        onEditPress={onEditPhotoPress}
      />
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
    changePhoto: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
  });
