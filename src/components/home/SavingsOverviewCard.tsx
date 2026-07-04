import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { formatShortDate } from "../../lib/formatDate";
import { formatNaira } from "../../lib/formatMoney";
import { formatDaysToGo, groupStatusKey } from "../../lib/homeSpeech";
import { formatPayoutProgressLabel } from "../../lib/localizeActivity";
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
  const theme = useTheme();
  const { t, i18n } = useTranslation();
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
        <Ionicons name="chevron-forward" size={19} color={theme.colors.textPrimary} />
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
          <Text style={styles.memberCount}>
            {t("home.memberCount", { count: progress.memberCount })}
          </Text>
          <Text style={styles.payoutProgress}>
            {formatPayoutProgressLabel(
              t,
              progress.payoutNumber,
              progress.payoutAmountPaid,
              progress.payoutAmountTotal,
              i18n.language,
            )}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.payoutCol}>
          <Text style={styles.label}>{t("home.nextPayout")}</Text>
          <View style={styles.payoutIconWrap}>
            <Ionicons name="receipt-outline" size={24} color={theme.colors.textPrimary} />
          </View>
          <Text style={styles.payoutDate}>{formatShortDate(payout.date)}</Text>
          <Text style={styles.payoutCountdown}>
            {formatDaysToGo(t, payout.daysRemaining)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onDetailsPress}
        accessibilityRole="button"
        accessibilityLabel={t("home.viewSavingsDetails")}
        style={({ pressed }) => [styles.detailsRow, pressed && styles.pressed]}
      >
        <View style={styles.detailsLeft}>
          <Ionicons name="document-text-outline" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.detailsText}>
            {t("home.viewSavingsDetails")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={12} color={theme.colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      backgroundColor: theme.colors.savingsCardBg,
      paddingVertical: 5,
      paddingHorizontal: 15,
      gap: 20,
    },
    groupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pressed: {
      opacity: 0.85,
    },
    groupLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    groupDetails: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
    },
    groupName: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.successMuted,
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.colors.successDark,
    },
    cycle: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    },
    progressCol: {
      flex: 1,
      maxWidth: 140,
      gap: 8,
    },
    payoutCol: {
      width: 115,
      gap: 10,
    },
    divider: {
      width: 1,
      height: 87,
      backgroundColor: theme.colors.divider,
    },
    label: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    stat: {
      ...theme.typography.progressStat,
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
    memberCount: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    payoutProgress: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    payoutIconWrap: {
      alignSelf: "flex-start",
      padding: 6,
      borderRadius: 30,
      backgroundColor: theme.colors.payoutIconBgAlt,
    },
    payoutDate: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    payoutCountdown: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
    },
    detailsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    detailsText: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
  });
