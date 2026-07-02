import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { formatNaira } from "../../lib/formatMoney";
import { localizeActivityItem } from "../../lib/localizeActivity";
import type { ActivityType, RecentActivityItem } from "../../models/home";
import { useThemedStyles, type Theme } from "../../theme";

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
  onViewAllPress?: () => void;
  onItemPress?: (item: RecentActivityItem) => void;
  viewAllLabel: string;
};

function activityIcon(type: ActivityType): {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
} {
  switch (type) {
    case "payment_received":
      return {
        name: "checkmark",
        color: "#00732E",
        bg: "#D2FFDA",
      };
    case "contribution_reminder":
      return {
        name: "calendar-outline",
        color: "#6B4FA0",
        bg: "#EDE7F6",
      };
    case "upcoming_payout":
      return {
        name: "calendar-outline",
        color: "#C77700",
        bg: "#FFECC9",
      };
  }
}

export function RecentActivitySection({
  items,
  onViewAllPress,
  onItemPress,
  viewAllLabel,
}: RecentActivitySectionProps) {
  const { t } = useTranslation();
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
          const icon = activityIcon(item.type);
          const copy = localizeActivityItem(t, item);
          const isLast = index === items.length - 1;

          return (
            <Pressable
              key={item.id}
              onPress={() => onItemPress?.(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                !isLast && styles.itemBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={18} color={icon.color} />
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{copy.title}</Text>
                <Text style={styles.itemSubtitle}>{copy.subtitle}</Text>
                <Text style={styles.itemDate}>{copy.dateLabel}</Text>
              </View>

              {item.amount !== undefined ? (
                <Text style={styles.itemAmount}>
                  {formatNaira(item.amount)}
                </Text>
              ) : item.showChevron ? (
                <Ionicons name="chevron-forward" size={18} color="#6D7888" />
              ) : null}
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
      gap: theme.spacing.sm + 4,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    viewAll: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.success,
    },
    list: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      ...theme.shadows.card,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm + 4,
      padding: theme.spacing.md,
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.inputBorder,
    },
    pressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    itemBody: {
      flex: 1,
      gap: 2,
    },
    itemTitle: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    itemSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    itemDate: {
      ...theme.typography.micro,
      color: theme.colors.textMuted,
    },
    itemAmount: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.success,
    },
  });
