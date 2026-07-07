import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { buildGroupListCardViewModel } from "../../lib/buildGroupListCardViewModel";
import { formatShortDate } from "../../lib/formatDate";
import { formatOrdinal } from "../../lib/formatOrdinal";
import { formatNaira } from "../../lib/formatMoney";
import type { GroupSummary } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type ReturningGroupListCardProps = {
  group: GroupSummary;
  index: number;
  onPress: () => void;
  loading?: boolean;
};

function StatColumn({
  label,
  value,
  valueColor,
  styles,
}: {
  label: string;
  value: string;
  valueColor?: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

export function ReturningGroupListCard({
  group,
  index,
  onPress,
  loading = false,
}: ReturningGroupListCardProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const viewModel = buildGroupListCardViewModel(group, index);
  const fillWidth = `${viewModel.progressPercent}%`;

  const statusLabel = t(`groups.list.status.${viewModel.statusKey}`);
  const statusColor =
    viewModel.statusKey === "paid"
      ? theme.colors.successDark
      : viewModel.statusKey === "notPaid"
        ? theme.colors.amountDue
        : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      accessibilityLabel={group.name}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <AjoLedgerLogoMark size={40} variant="square" />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {group.name}
            </Text>
            {group.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {group.description}
              </Text>
            ) : null}
          </View>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.brand} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        )}
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.statsRow}>
        <StatColumn
          label={t("groups.list.contributionLabel")}
          value={formatNaira(viewModel.contributionAmount)}
          styles={styles}
        />
        <View style={styles.statDivider} />
        <StatColumn
          label={t("groups.list.statusLabel")}
          value={statusLabel}
          valueColor={statusColor}
          styles={styles}
        />
        <View style={styles.statDivider} />
        <StatColumn
          label={t("groups.list.positionLabel")}
          value={formatOrdinal(viewModel.position, i18n.language)}
          styles={styles}
        />
      </View>

      <View style={styles.progressHeaderRow}>
        <Text style={styles.progressLabel} numberOfLines={1}>
          {t("groups.list.potProgress", {
            collected: formatNaira(viewModel.potCollected),
            target: formatNaira(viewModel.potTarget),
          })}
        </Text>
        <View style={styles.cycleBadge}>
          <Text style={styles.cycleBadgeText}>
            {t("groups.list.cycleLabel", { number: viewModel.currentCycle })}
          </Text>
        </View>
      </View>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: viewModel.progressPercent,
        }}
      >
        <View style={[styles.fill, { width: fillWidth as `${number}%` }]} />
      </View>

      <Text style={styles.nextPayout}>
        {t("groups.list.nextPayout", {
          date: formatShortDate(viewModel.nextPayoutDate),
        })}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 16,
      padding: theme.spacing.md,
      gap: 14,
      ...theme.shadows.card,
    },
    pressed: {
      opacity: 0.85,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    headerLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    description: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: theme.colors.inputBorder,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "stretch",
    },
    statColumn: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 4,
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.inputBorder,
      marginVertical: 2,
    },
    statLabel: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    statValue: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    progressHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    progressLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    cycleBadge: {
      backgroundColor: theme.colors.successMuted,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    cycleBadgeText: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
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
      backgroundColor: theme.colors.brand,
    },
    nextPayout: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
