import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { localizeActivityItem } from "../../lib/localizeActivity";
import type { ActivityType, RecentActivityItem } from "../../models/home";
import { useThemedStyles, type Theme } from "../../theme";

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
  onViewAllPress?: () => void;
  onItemPress?: (item: RecentActivityItem) => void;
  viewAllLabel: string;
};

function activityIconStyle(type: ActivityType): {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
} {
  switch (type) {
    case "payment_paid":
      return { name: "checkmark", bg: "#00B04A" };
    case "contribution_reminder":
      return { name: "receipt-outline", bg: "#8FB1D7" };
    case "upcoming_payout":
      return { name: "receipt-outline", bg: "#FFD56F" };
  }
}

export function RecentActivitySection({
  items,
  onViewAllPress,
  onItemPress,
  viewAllLabel,
}: RecentActivitySectionProps) {
  const { t, i18n } = useTranslation();
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
          const icon = activityIconStyle(item.type);
          const copy = localizeActivityItem(t, item, i18n.language);
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <Pressable
              key={item.id}
              onPress={() => onItemPress?.(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                isFirst && styles.itemFirst,
                isLast && styles.itemLast,
                !isFirst && !isLast && styles.itemMiddle,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.itemContent}>
                <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={18} color="#FFFFFF" />
                </View>

                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{copy.title}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemSubtitle}>{copy.subtitle}</Text>
                    <Text style={styles.itemDate}>{copy.dateLabel}</Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={15} color="#2C3138" />
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
      color: theme.colors.figmaBlack,
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
    itemMeta: {
      gap: 2,
    },
    itemTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.figmaBlack,
    },
    itemSubtitle: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.figmaBlack,
    },
    itemDate: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.figmaBlack,
    },
  });
