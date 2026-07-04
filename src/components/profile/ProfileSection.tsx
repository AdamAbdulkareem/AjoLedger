import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles, type Theme } from "../../theme";

type ProfileSectionProps = {
  title: string;
  children: ReactNode;
  titleStyle?: "body" | "subtitle";
};

export function ProfileSection({
  title,
  children,
  titleStyle = "body",
}: ProfileSectionProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.title,
          titleStyle === "subtitle" && styles.titleSubtitle,
        ]}
      >
        {title}
      </Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: theme.spacing.md,
    },
    title: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    titleSubtitle: {
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    content: {
      gap: theme.spacing.md,
    },
  });
