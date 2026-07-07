import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { localizeActivityItem } from "../../lib/localizeActivity";
import type { ActivityType, RecentActivityItem } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
  showGroupTags?: boolean;
  onViewAllPress?: () => void;
  onItemPress?: (item: RecentActivityItem) => void;
  viewAllLabel: string;
};

function activityIconStyle(
  type: ActivityType,
  colors: Theme["colors"],
): {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
} {
  switch (type) {
    case "payment_paid":
      return { name: "checkmark", bg: colors.activityPaidBg };
    case "contribution_reminder":
      return { name: "receipt-outline", bg: colors.activityReminderBg };
    case "upcoming_payout":
      return { name: "receipt-outline", bg: colors.activityPayoutBg };
  }
}

export function RecentActivitySection({
  items,
  showGroupTags = false,
  onViewAllPress,
  onItemPress,
  viewAllLabel,
}: RecentActivitySectionProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.recentActivity")}</Text>
        <Pressable
          onPress={onViewAllPress}
          accessibilityRole="button"
          accessibilityLabel={viewAllLabel}
        >
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const icon = activityIconStyle(item.type, theme.colors);
          const copy = localizeActivityItem(t, item, i18n.language);
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isOnly = isFirst && isLast;

          return (
            <Pressable
              key={item.id}
              onPress={() => onItemPress?.(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                isOnly
                  ? styles.itemOnly
                  : isFirst
                    ? styles.itemFirst
                    : isLast
                      ? styles.itemLast
                      : styles.itemMiddle,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.itemContent}>
                <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={18} color="#FFFFFF" />
                </View>

                <View style={styles.itemBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{copy.title}</Text>
                    {showGroupTags && item.groupName ? (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {t("home.activityTag", { name: item.groupName })}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemSubtitle}>{copy.subtitle}</Text>
                    <Text style={styles.itemDate}>{copy.dateLabel}</Text>
                  </View>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={theme.colors.textPrimary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      gap: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 3,
    },
    title: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    viewAll: {
      ...theme.typography.captionMedium,
      color: theme.colors.viewAllLink,
    },
    list: {
      gap: 0,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderColor: theme.colors.activityListBorder,
      backgroundColor: theme.colors.surface,
    },
    itemOnly: {
      borderWidth: 1,
      borderRadius: 10,
    },
    itemFirst: {
      borderWidth: 1,
      borderBottomWidth: 0,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    itemMiddle: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.activityListBorder,
    },
    itemLast: {
      borderWidth: 1,
      borderTopWidth: 0,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    pressed: {
      opacity: 0.85,
    },
    itemContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrap: {
      padding: 6,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    itemBody: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 4,
    },
    tag: {
      backgroundColor: theme.colors.activityTagBg,
      borderRadius: 9,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    tagText: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    itemMeta: {
      gap: 2,
    },
    itemTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    itemSubtitle: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    itemDate: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
  });
