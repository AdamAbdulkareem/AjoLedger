import { StyleSheet, Text, View } from "react-native";

import { CachedAvatar } from "./CachedAvatar";
import { maskEmail } from "../lib/maskEmail";
import { useThemedStyles, type Theme } from "../theme";

type PasscodeUserBadgeProps = {
  email: string;
  avatarUri?: string | null;
};

export function PasscodeUserBadge({ email, avatarUri }: PasscodeUserBadgeProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <CachedAvatar
          avatarUri={avatarUri}
          style={styles.avatar}
          accessibilityLabel={email}
        />
        <View style={styles.onlineDot} accessibilityElementsHidden />
      </View>
      <Text style={styles.email}>{maskEmail(email)}</Text>
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
      width: 70,
      height: 70,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
    onlineDot: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.avatarOnline,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    email: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
  });
