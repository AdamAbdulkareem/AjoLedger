import { Image, StyleSheet, View } from "react-native";

import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

export function GroupsHeader() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.topRow}>
      <Image
        source={LOGO_MARK}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    topRow: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    logo: {
      width: 50,
      height: 50,
    },
  });
