import { StyleSheet, Text, View } from "react-native";

import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { ListenButton } from "./ListenButton";
import { useThemedStyles, type Theme } from "../../theme";

type HomeTopBarProps = {
  speechText: string;
};

export function HomeTopBar({ speechText }: HomeTopBarProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <AjoLedgerLogoMark size={36} variant="circle" />
        <Text style={styles.brandText}>AjoLedger</Text>
      </View>
      {speechText ? <ListenButton text={speechText} /> : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    brand: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    brandText: {
      ...theme.typography.subtitle,
      color: theme.colors.successDark,
    },
  });
