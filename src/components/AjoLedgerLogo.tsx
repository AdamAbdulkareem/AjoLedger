import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const logoSource = require("../../assets/brand/ajoledger-logo.png");

export const AJOLEDGER_LOGO_SIZE = 120;

type AjoLedgerLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function AjoLedgerLogo({
  size = AJOLEDGER_LOGO_SIZE,
  style,
}: AjoLedgerLogoProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
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
  },
});
