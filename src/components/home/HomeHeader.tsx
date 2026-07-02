import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { getGreetingKey } from "../../lib/greeting";
import { useThemedStyles, type Theme } from "../../theme";

type HomeHeaderProps = {
  displayName: string;
};

export function HomeHeader({ displayName }: HomeHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const greetingKey = getGreetingKey();

  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.greeting}>
          {t(`home.${greetingKey}`, { name: displayName })} 👋
        </Text>
        <Text style={styles.subtitle}>{t("home.overviewSubtitle")}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.initial}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
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
      gap: theme.spacing.xs,
    },
    greeting: {
      ...theme.typography.headline,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.successMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    initial: {
      ...theme.typography.subtitle,
      color: theme.colors.successDark,
    },
  });
