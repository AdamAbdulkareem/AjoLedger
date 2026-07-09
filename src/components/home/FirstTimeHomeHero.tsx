import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useThemedStyles, type Theme } from "../../theme";

const HERO_ILLUSTRATION = require("../../../assets/brand/ajoledger-logo.png");

type FirstTimeHomeHeroProps = {
  onJoinOrCreatePress: () => void;
};

export function FirstTimeHomeHero({ onJoinOrCreatePress }: FirstTimeHomeHeroProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("home.firstTime.heroTitle")}</Text>
        <Text style={styles.message}>{t("home.firstTime.heroMessage")}</Text>
        <Pressable
          onPress={onJoinOrCreatePress}
          accessibilityRole="button"
          accessibilityLabel={t("home.firstTime.joinOrCreateGroup")}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaLabel}>
            {t("home.firstTime.joinOrCreateGroup")}
          </Text>
        </Pressable>
      </View>
      <Image
        source={HERO_ILLUSTRATION}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: theme.colors.payoutIconBg,
      borderRadius: 20,
      minHeight: 148,
      overflow: "hidden",
    },
    content: {
      flex: 1,
      paddingLeft: 21,
      paddingTop: 16,
      paddingBottom: 16,
      paddingRight: theme.spacing.sm,
      gap: theme.spacing.sm,
      justifyContent: "center",
      maxWidth: 170,
    },
    title: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    message: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
    cta: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.brand,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginTop: 4,
    },
    ctaLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.85,
    },
    illustration: {
      width: 130,
      height: 130,
      alignSelf: "flex-end",
      marginRight: -8,
      marginBottom: -8,
    },
  });
