import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatShortDate } from "../../lib/formatDate";
import { formatPlainAmount, formatNaira } from "../../lib/formatMoney";
import { getCarouselProgressTone } from "../../lib/carouselProgressTone";
import { formatDaysToGo } from "../../lib/homeSpeech";
import type { GroupHomeDashboard } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type HomeGroupCarouselCardProps = {
  dashboard: GroupHomeDashboard;
  cardWidth: number;
  cardHeight: number;
  isSelected: boolean;
  onPress: () => void;
};

function progressColors(
  tone: ReturnType<typeof getCarouselProgressTone>,
  theme: Theme,
) {
  switch (tone) {
    case "urgent":
      return {
        fill: theme.colors.progressUrgent,
        track: theme.colors.progressUrgentBg,
        text: theme.colors.progressUrgent,
      };
    case "success":
      return {
        fill: theme.colors.success,
        track: theme.colors.successMuted,
        text: theme.colors.success,
      };
    case "neutral":
      return {
        fill: theme.colors.progressNeutral,
        track: theme.colors.progressNeutralBg,
        text: theme.colors.progressNeutral,
      };
  }
}

export function HomeGroupCarouselCard({
  dashboard,
  cardWidth,
  cardHeight,
  isSelected,
  onPress,
}: HomeGroupCarouselCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const tone = getCarouselProgressTone(
    dashboard.progress.percent,
    dashboard.amountRemains.daysUntilDue,
    dashboard.contributionStatusKey,
  );
  const colors = progressColors(tone, theme);
  const fillWidth = `${Math.min(Math.max(dashboard.progress.percent, 0), 100)}%`;
  const frequencyLabel =
    dashboard.group.cycleFrequency === "monthly"
      ? t("home.cycleMonthly")
      : t("home.cycleWeekly");
  const balanceAmount =
    dashboard.amountRemains.amount > 0
      ? dashboard.amountRemains.amount
      : dashboard.progress.payoutAmountPaid;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={dashboard.group.name}
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          minHeight: cardHeight,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {dashboard.group.name}
        </Text>
        <Text style={styles.cycle} numberOfLines={2}>
          {t("home.cycleAmount", {
            frequency: frequencyLabel,
            amount: formatNaira(dashboard.group.amountPerMember),
          })}
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statLine} numberOfLines={1}>
          {t("home.urgentDuePrefix")}
          <Text style={styles.statBold}>
            {t("home.urgentDueDays", {
              count: dashboard.amountRemains.daysUntilDue,
            })}
          </Text>
        </Text>
        <Text style={styles.statLine} numberOfLines={1}>
          {t("home.balancePrefix")}
          <Text style={styles.statBold}>{formatPlainAmount(balanceAmount)}</Text>
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.track, { backgroundColor: colors.track }]}>
          <View
            style={[
              styles.fill,
              { width: fillWidth as `${number}%`, backgroundColor: colors.fill },
            ]}
          />
        </View>
        <View style={styles.progressMeta}>
          <Text style={[styles.percent, { color: colors.text }]}>
            {dashboard.progress.percent}%
          </Text>
          <Text style={styles.date}>{formatShortDate(dashboard.payout.date)}</Text>
        </View>
      </View>

      <View style={styles.pill}>
        <Text style={styles.pillText}>
          {formatDaysToGo(t, dashboard.payout.daysRemaining)}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      backgroundColor: theme.colors.carouselCardBg,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 12,
      justifyContent: "space-between",
    },
    pressed: {
      opacity: 0.94,
    },
    header: {
      gap: 4,
    },
    name: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    cycle: {
      ...theme.typography.micro,
      lineHeight: 12,
      color: theme.colors.textPrimary,
    },
    stats: {
      gap: 8,
    },
    statLine: {
      ...theme.typography.micro,
      lineHeight: 12,
      color: theme.colors.textPrimary,
    },
    statBold: {
      fontFamily: theme.fontFamily.semibold,
    },
    progressSection: {
      gap: 8,
    },
    track: {
      height: 10,
      borderRadius: 6,
      overflow: "hidden",
    },
    fill: {
      height: 10,
      borderRadius: 6,
    },
    progressMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    percent: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
    },
    date: {
      ...theme.typography.micro,
      lineHeight: 12,
      color: theme.colors.textPrimary,
    },
    pill: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.payoutIconBgAlt,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    pillText: {
      ...theme.typography.micro,
      lineHeight: 12,
      color: theme.colors.textPrimary,
    },
  });
