import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { resolveAvatarSource } from "../../lib/avatarSource";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type AvatarWithEditBadgeProps = {
  avatarUri?: string | null;
  imageAccessibilityLabel: string;
  editAccessibilityLabel: string;
  onEditPress?: () => void;
};

export function AvatarWithEditBadge({
  avatarUri,
  imageAccessibilityLabel,
  editAccessibilityLabel,
  onEditPress,
}: AvatarWithEditBadgeProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.avatarWrap}>
      <Image
        source={resolveAvatarSource(avatarUri)}
        style={styles.avatar}
        accessibilityLabel={imageAccessibilityLabel}
      />
      <Pressable
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel={editAccessibilityLabel}
        style={({ pressed }) => [styles.cameraBadge, pressed && styles.pressed]}
      >
        <Ionicons name="camera-outline" size={16} color={theme.colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
  });
