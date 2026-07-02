import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { groupStatusKey } from "../../lib/homeSpeech";
import { formatNaira } from "../../lib/formatMoney";
import { formatShortDate } from "../../lib/formatDate";
import { formatDaysToGo } from "../../lib/homeSpeech";
import type { HomeDashboard } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type SavingsOverviewCardProps = {
  group: HomeDashboard["group"];
  progress: HomeDashboard["progress"];
  payout: HomeDashboard["payout"];
  onGroupPress?: () => void;
  onDetailsPress?: () => void;
};

export function SavingsOverviewCard({
  group,
  progress,
  payout,
  onGroupPress,
  onDetailsPress,
}: SavingsOverviewCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const fillWidth = `${Math.min(Math.max(progress.percent, 0), 100)}%`;
  const frequencyLabel =
    group.cycleFrequency === "monthly"
      ? t("home.cycleMonthly")
      : t("home.cycleWeekly");

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onGroupPress}
        accessibilityRole="button"
        accessibilityLabel={group.name}
        style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}
      >
        <View style={styles.groupLeft}>
          <AjoLedgerLogoMark size={42} variant="square" />
          <View style={styles.groupDetails}>
            <View style={styles.titleRow}>
              <Text style={styles.groupName}>{group.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {t(`home.${groupStatusKey(group.status)}`)}
                </Text>
              </View>
            </View>
            <Text style={styles.cycle}>
              {t("home.cycleAmount", {
                frequency: frequencyLabel,
                amount: formatNaira(group.amountPerMember),
              })}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6D7888" />
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.progressCol}>
          <Text style={styles.label}>{t("home.myProgress")}</Text>
          <Text style={styles.stat}>{progress.percent}%</Text>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: progress.percent,
            }}
          >
            <View style={[styles.fill, { width: fillWidth as `${number}%` }]} />
          </View>
          <Text style={styles.detail}>
            {t("home.contributed", {
              paid: formatNaira(progress.amountPaid),
              total: formatNaira(progress.expectedTotal),
            })}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.payoutCol}>
          <Text style={styles.label}>{t("home.nextPayout")}</Text>
          <View style={styles.payoutIconWrap}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.payoutIcon}
            />
          </View>
          <Text style={styles.payoutDate}>{formatShortDate(payout.date)}</Text>
          <Text style={styles.detail}>
            {formatDaysToGo(t, payout.daysRemaining)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsOuter}>
        <Pressable
          onPress={onDetailsPress}
          accessibilityRole="button"
          accessibilityLabel={t("home.viewSavingsDetails")}
          style={({ pressed }) => [
            styles.detailsRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.detailsLeft}>
            <Ionicons name="document-text-outline" size={18} color="#2C3138" />
            <Text style={styles.detailsText}>
              {t("home.viewSavingsDetails")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6D7888" />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      ...theme.shadows.card,
    },
    groupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
    groupLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm + 4,
    },
    groupDetails: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    titleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    groupName: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: theme.colors.successMuted,
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.colors.successDark,
    },
    cycle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    progressCol: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    payoutCol: {
      width: 96,
      gap: theme.spacing.sm,
    },
    divider: {
      width: 1,
      backgroundColor: theme.colors.divider,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    stat: {
      ...theme.typography.stat,
      color: theme.colors.successDark,
    },
    track: {
      height: 10,
      borderRadius: 6,
      backgroundColor: theme.colors.successMuted,
      overflow: "hidden",
    },
    fill: {
      height: 10,
      borderRadius: 6,
      backgroundColor: theme.colors.success,
    },
    detail: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    payoutIconWrap: {
      alignSelf: "flex-start",
      padding: 6,
      borderRadius: 30,
      backgroundColor: theme.colors.payoutIconBg,
    },
    payoutDate: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    detailsOuter: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 4,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      backgroundColor: theme.colors.cardFooterBg,
    },
    detailsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    detailsText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
  });
