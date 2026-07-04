import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemedStyles, type Theme } from "../theme";

type AjoLedgerLogoMarkProps = {
  size?: number;
  variant?: "circle" | "square";
};

export function AjoLedgerLogoMark({
  size = 36,
  variant = "circle",
}: AjoLedgerLogoMarkProps) {
  const styles = useThemedStyles(createStyles);
  const iconSize = Math.round(size * 0.5);

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: variant === "circle" ? size / 2 : 6,
        },
      ]}
    >
      <Ionicons name="people" size={iconSize} color="#FFFFFF" />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      backgroundColor: theme.colors.successDark,
      alignItems: "center",
      justifyContent: "center",
    },
  });
