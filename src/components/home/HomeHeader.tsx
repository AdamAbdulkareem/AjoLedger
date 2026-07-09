import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { CachedAvatar } from "../CachedAvatar";
import { getGreetingKey } from "../../lib/greeting";
import { useThemedStyles, type Theme } from "../../theme";

const LOGO = require("../../../assets/brand/ajoledger-logo.png");

/** Figma registered-home header logo block (icon + wordmark + tagline). */
const LOGO_SIZE = 56;

type HomeHeaderProps = {
  displayName: string;
  avatarUrl?: string | null;
};

export function HomeHeader({ displayName, avatarUrl }: HomeHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const greetingKey = getGreetingKey();

  return (
    <View style={styles.row}>
      <View style={styles.brandRow}>
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="AjoLedger"
        />
        <View style={styles.textWrap}>
          <Text style={styles.greeting}>
            {t(`home.${greetingKey}`, { name: displayName })}
          </Text>
          <Text style={styles.subtitle}>{t("home.overviewSubtitle")}</Text>
        </View>
      </View>
      <View style={styles.avatarWrap}>
        <CachedAvatar
          avatarUri={avatarUrl}
          style={styles.avatar}
          accessibilityLabel={displayName}
        />
        <View style={styles.statusDot} />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    brandRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      minWidth: 0,
    },
    logo: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
    },
    textWrap: {
      flex: 1,
      gap: 4,
      minWidth: 0,
    },
    greeting: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
    avatarWrap: {
      width: 40,
      height: 40,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    statusDot: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.avatarOnline,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
  });
