import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AvatarWithEditBadge } from "./AvatarWithEditBadge";
import { useThemedStyles, type Theme } from "../../theme";

type ProfileAvatarSectionProps = {
  displayName: string;
  email: string;
  avatarUri?: string | null;
  onEditPhotoPress?: () => void;
};

export function ProfileAvatarSection({
  displayName,
  email,
  avatarUri,
  onEditPhotoPress,
}: ProfileAvatarSectionProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <AvatarWithEditBadge
        avatarUri={avatarUri}
        imageAccessibilityLabel={displayName}
        editAccessibilityLabel={t("profile.editPhoto.title")}
        onEditPress={onEditPhotoPress}
      />
      <View style={styles.nameBlock}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    nameBlock: {
      alignItems: "center",
      paddingVertical: 10,
      gap: 2,
    },
    name: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    email: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
  });
