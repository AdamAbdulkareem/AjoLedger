import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type GroupsHeaderProps = {
  onEnterCodePress: () => void;
};

export function GroupsHeader({ onEnterCodePress }: GroupsHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.topRow}>
      <View style={styles.logoWrap}>
        <Image
          source={LOGO_MARK}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Pressable
        onPress={onEnterCodePress}
        accessibilityRole="button"
        accessibilityLabel={t("groups.enterCode")}
        style={({ pressed }) => [styles.enterCodeButton, pressed && styles.pressed]}
      >
        <Text style={styles.enterCodeLabel}>{t("groups.enterCode")}</Text>
      </Pressable>
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
    logoWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 50,
      height: 50,
    },
    enterCodeButton: {
      position: "absolute",
      right: 0,
      top: 3,
      backgroundColor: theme.colors.brand,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    enterCodeLabel: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
