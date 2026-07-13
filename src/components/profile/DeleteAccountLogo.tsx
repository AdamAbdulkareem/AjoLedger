import { Image, StyleSheet, View } from "react-native";

const LOGO = require("../../../assets/brand/ajoledger-logo.png");

const LOGO_SIZE = 50;

export function DeleteAccountLogo() {
  return (
    <View style={styles.wrap}>
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="AjoLedger"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
