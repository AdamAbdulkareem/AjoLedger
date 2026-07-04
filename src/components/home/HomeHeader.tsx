import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { getGreetingKey } from "../../lib/greeting";
import { useThemedStyles, type Theme } from "../../theme";

const DEFAULT_AVATAR = require("../../../assets/home/avatar-default.png");

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
      <View style={styles.textWrap}>
        <Text style={styles.greeting}>
          {t(`home.${greetingKey}`, { name: displayName })}
        </Text>
        <Text style={styles.subtitle}>{t("home.overviewSubtitle")}</Text>
      </View>
      <View style={styles.avatarWrap}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : DEFAULT_AVATAR}
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
    textWrap: {
      flex: 1,
      gap: 4,
      maxWidth: 165,
    },
    greeting: {
      ...theme.typography.subtitle,
      color: theme.colors.figmaBlack,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.figmaBlack,
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
