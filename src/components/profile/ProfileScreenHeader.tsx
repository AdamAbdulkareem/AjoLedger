import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles, type Theme } from "../../theme";

type ProfileScreenHeaderProps = {
  title: string;
};

export function ProfileScreenHeader({ title }: ProfileScreenHeaderProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
    },
    spacer: {
      width: 24,
      height: 24,
    },
    title: {
      ...theme.typography.title,
      fontFamily: theme.fontFamily.semibold,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
  });
