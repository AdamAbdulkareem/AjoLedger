import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { GroupsActionCard } from "./GroupsActionCard";
import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");
const HERO_ILLUSTRATION = require("../../../assets/groups/group-hero.png");

type NewUserGroupsContentProps = {
  onEnterCodePress: () => void;
  onJoinGroupPress: () => void;
  onCreateGroupPress: () => void;
};

export function NewUserGroupsContent({
  onEnterCodePress,
  onJoinGroupPress,
  onCreateGroupPress,
}: NewUserGroupsContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.paddedSection}>
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
