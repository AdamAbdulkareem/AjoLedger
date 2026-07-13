import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { GroupsActionCard } from "./GroupsActionCard";
import { GroupsHeader } from "./GroupsHeader";
import { useThemedStyles, type Theme } from "../../theme";

const HERO_ILLUSTRATION = require("../../../assets/groups/group-hero.png");

type NewUserGroupsContentProps = {
  onJoinGroupPress: () => void;
  onCreateGroupPress: () => void;
};

export function NewUserGroupsContent({
  onJoinGroupPress,
  onCreateGroupPress,
}: NewUserGroupsContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.paddedSection}>
        <GroupsHeader />
      </View>

      <Image
        source={HERO_ILLUSTRATION}
        style={styles.hero}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessibilityLabel={t("groups.empty.headline")}
      />

      <View style={[styles.paddedSection, styles.bottomSection]}>
        <View style={styles.messageBlock}>
          <Text style={styles.headline}>{t("groups.empty.headline")}</Text>
          <Text style={styles.message}>{t("groups.empty.message")}</Text>
        </View>

        <View style={styles.actions}>
          <GroupsActionCard
            variant="join"
            title={t("groups.empty.join.title")}
            subtitle={t("groups.empty.join.subtitle")}
            onPress={onJoinGroupPress}
          />
          <GroupsActionCard
            variant="create"
            title={t("groups.empty.create.title")}
            subtitle={t("groups.empty.create.subtitle")}
            onPress={onCreateGroupPress}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 20,
    },
    paddedSection: {
      paddingHorizontal: theme.spacing.md,
    },
    bottomSection: {
      gap: 20,
    },
    hero: {
      width: "100%",
      height: 249,
      borderRadius: 4,
    },
    messageBlock: {
      alignItems: "center",
      gap: 12,
      paddingHorizontal: theme.spacing.sm,
    },
    headline: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 28,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    message: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      textAlign: "center",
      maxWidth: 236,
    },
    actions: {
      gap: 20,
    },
  });
