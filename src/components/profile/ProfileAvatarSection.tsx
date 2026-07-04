import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { resolveAvatarSource } from "../../lib/avatarSource";
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
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image
          source={resolveAvatarSource(avatarUri)}
          style={styles.avatar}
          accessibilityLabel={displayName}
        />
        <Pressable
          onPress={onEditPhotoPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
          style={({ pressed }) => [styles.cameraBadge, pressed && styles.pressed]}
        >
          <Ionicons name="camera-outline" size={16} color="#2C3138" />
        </Pressable>
      </View>
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
    pressed: {
      opacity: 0.85,
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
      color: "#181C21",
      textAlign: "center",
    },
    email: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
  });
