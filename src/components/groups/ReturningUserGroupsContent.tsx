import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { GroupListCard } from "./GroupListCard";
import { GroupsActionCard } from "./GroupsActionCard";
import type { GroupSummary } from "../../models/group";
import { useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type ReturningUserGroupsContentProps = {
  groups: GroupSummary[];
  joinedSuccessMessage?: string;
  openingGroupId?: string | null;
  onEnterCodePress: () => void;
  onCreateGroupPress: () => void;
  onGroupPress: (group: GroupSummary) => void;
};

export function ReturningUserGroupsContent({
  groups,
  joinedSuccessMessage,
  openingGroupId = null,
  onEnterCodePress,
  onCreateGroupPress,
  onGroupPress,
}: ReturningUserGroupsContentProps) {
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

      {joinedSuccessMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{joinedSuccessMessage}</Text>
        </View>
      ) : null}

      <View style={styles.listSection}>
        <Text style={styles.listHeading}>{t("groups.list.heading")}</Text>
        <View style={styles.list}>
          {groups.map((group) => (
            <GroupListCard
              key={group.id}
              group={group}
              loading={openingGroupId === group.id}
              onPress={() => onGroupPress(group)}
            />
          ))}
        </View>
      </View>

      <View style={styles.paddedSection}>
        <GroupsActionCard
          variant="create"
          title={t("groups.list.createNew")}
          subtitle={t("groups.list.createNewSubtitle")}
          onPress={onCreateGroupPress}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 20,
      paddingBottom: theme.spacing.lg,
    },
    paddedSection: {
      paddingHorizontal: theme.spacing.md,
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
    successBanner: {
      marginHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.successMuted,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    successText: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
      textAlign: "center",
    },
    listSection: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    listHeading: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    list: {
      gap: theme.spacing.sm,
    },
  });
