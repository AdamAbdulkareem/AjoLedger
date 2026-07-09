import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupRoleBadgeProps = {
  isCreator: boolean;
  /** Tighter layout for narrow surfaces (e.g. home carousel cards). */
  compact?: boolean;
};

export function GroupRoleBadge({ isCreator, compact = false }: GroupRoleBadgeProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const label = isCreator
    ? t("groups.list.roleCreator")
    : t("groups.list.roleMember");
  const accessibilityLabel = isCreator
    ? t("groups.list.creatorBadge")
    : t("groups.list.memberBadge");

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        isCreator ? styles.creatorBadge : styles.memberBadge,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <Ionicons
        name={isCreator ? "star" : "people"}
        size={compact ? 9 : 11}
        color={isCreator ? theme.colors.link : theme.colors.progressNeutral}
      />
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          isCreator ? styles.creatorLabel : styles.memberLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 4,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexShrink: 0,
    },
    badgeCompact: {
      gap: 2,
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    creatorBadge: {
      backgroundColor: theme.colors.carouselCardBg,
      borderWidth: 1,
      borderColor: theme.colors.brand,
    },
    memberBadge: {
      backgroundColor: theme.colors.progressNeutralBg,
      borderWidth: 1,
      borderColor: theme.colors.inviteCardBorder,
    },
    label: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 11,
      lineHeight: 14,
    },
    labelCompact: {
      fontSize: 9,
      lineHeight: 11,
    },
    creatorLabel: {
      color: theme.colors.link,
    },
    memberLabel: {
      color: theme.colors.progressNeutral,
    },
  });
