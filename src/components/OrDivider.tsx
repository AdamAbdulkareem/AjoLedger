import { StyleSheet, Text, View } from "react-native";

import { useThemedStyles, type Theme } from "../theme";

type OrDividerProps = {
  label: string;
};

export function OrDivider({ label }: OrDividerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.inputBorder,
    },
    label: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
  });
