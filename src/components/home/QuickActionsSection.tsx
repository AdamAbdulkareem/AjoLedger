import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { QuickActionRow } from "./QuickActionRow";
import { useThemedStyles, type Theme } from "../../theme";

type QuickActionsSectionProps = {
  onJoinGroupPress: () => void;
  onCreateGroupPress: () => void;
  onContactSupportPress: () => void;
  actionsLoading?: boolean;
};

export function QuickActionsSection({
  onJoinGroupPress,
  onCreateGroupPress,
  onContactSupportPress,
  actionsLoading = false,
}: QuickActionsSectionProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{t("home.firstTime.quickActions")}</Text>
      <QuickActionRow
        icon="enter-outline"
        title={t("home.firstTime.actions.join.title")}
        subtitle={t("home.firstTime.actions.join.subtitle")}
        onPress={onJoinGroupPress}
        disabled={actionsLoading}
      />
      <QuickActionRow
        icon="add-circle-outline"
        title={t("home.firstTime.actions.create.title")}
        subtitle={t("home.firstTime.actions.create.subtitle")}
        onPress={onCreateGroupPress}
        disabled={actionsLoading}
      />
      <QuickActionRow
        icon="help-circle-outline"
        title={t("home.firstTime.actions.help.title")}
        subtitle={t("home.firstTime.actions.help.subtitle")}
        trailingLabel={t("home.firstTime.actions.help.trailing")}
        onPress={onContactSupportPress}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: 10,
    },
    heading: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      paddingHorizontal: 4,
    },
  });
