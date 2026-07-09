import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { AjoLedgerLogoMark } from "../AjoLedgerLogoMark";
import { buildGroupListCardViewModel, mapContributionStatusKey } from "../../lib/buildGroupListCardViewModel";
import { formatShortDate } from "../../lib/formatDate";
import { formatNaira } from "../../lib/formatMoney";
import { getMemberAvatarColor, getMemberInitials } from "../../lib/memberAvatar";
import type { ContributionFrequency, GroupDetails, GroupMember } from "../../models/group";
import type { GroupContributionStatusKey } from "../../models/home";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type GroupLedgerContentProps = {
  group: GroupDetails;
  isAdmin: boolean;
};

function frequencyLabelKey(frequency?: ContributionFrequency): string {
  switch (frequency) {
    case "DAILY":
      return "groups.create.frequency.daily";
    case "WEEKLY":
      return "groups.create.frequency.weekly";
    case "MONTHLY":
    default:
      return "groups.create.frequency.monthly";
  }
}

function formatOrdinal(position: number): string {
  const mod100 = position % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${position}th`;
  }

  switch (position % 10) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}

function memberStatusKey(member: GroupMember): GroupContributionStatusKey {
  if (member.contributionStatus) {
    return mapContributionStatusKey(String(member.contributionStatus));
  }

  return "notPaid";
}

function statusColor(
  theme: Theme,
  key: GroupContributionStatusKey,
): { text: string; bg: string } {
  switch (key) {
    case "paid":
      return { text: theme.colors.successDark, bg: theme.colors.successMuted };
    case "partial":
      return { text: theme.colors.payoutIcon, bg: theme.colors.payoutIconBg };
    default:
      return { text: theme.colors.amountDue, bg: theme.colors.progressUrgentBg };
  }
}

type LedgerStats = {
  paid: number;
  pending: number;
  partial: number;
  total: number;
};

function computeLedgerStats(members: GroupMember[]): LedgerStats {
  const stats: LedgerStats = { paid: 0, pending: 0, partial: 0, total: members.length };

  for (const member of members) {
    const key = memberStatusKey(member);
    if (key === "paid") {
      stats.paid += 1;
    } else if (key === "partial") {
      stats.partial += 1;
    } else {
      stats.pending += 1;
    }
  }

  return stats;
}

function LedgerMemberRow({
  member,
  index,
  contributionAmount,
}: {
  member: GroupMember;
  index: number;
  contributionAmount: number;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createMemberRowStyles);
  const statusKey = memberStatusKey(member);
  const colors = statusColor(theme, statusKey);
  const dueAmount = member.dueAmount ?? contributionAmount;
  const isCleared = statusKey === "paid";

  return (
    <View style={styles.row}>
      <View style={styles.memberCol}>
        <View
          style={[styles.avatar, { backgroundColor: getMemberAvatarColor(index) }]}
        >
          <Text style={styles.avatarText}>{getMemberInitials(member.name)}</Text>
        </View>
        <View style={styles.memberText}>
          <Text style={styles.memberName} numberOfLines={1}>
            {member.name}
          </Text>
          {member.payoutTurn != null ? (
            <Text style={styles.position}>
              {t("groups.ledger.position", { position: member.payoutTurn })}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.dueCol}>
        {isCleared ? t("groups.ledger.cleared") : formatNaira(dueAmount)}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>
          {t(`groups.list.status.${statusKey}`)}
        </Text>
      </View>
    </View>
  );
}

export function GroupLedgerContent({ group, isAdmin }: GroupLedgerContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewModel = useMemo(
    () => buildGroupListCardViewModel(group),
    [group],
  );

  const cycle = group.cycleDetails;
  const currentWeek = cycle?.currentWeek ?? cycle?.currentCycle ?? 1;
  const totalWeeks =
    cycle?.totalWeeks ?? group.numberOfParticipants ?? group.joinedCount;
  const dueDate = cycle?.dueDate ?? cycle?.nextPayoutDate ?? "";
  const expectedAmount =
    cycle?.expectedAmount ??
    cycle?.potTarget ??
    (viewModel.contributionAmount > 0 && totalWeeks > 0
      ? viewModel.contributionAmount * totalWeeks
      : 0);

  const contributionAmount =
    group.contributionAmount ?? cycle?.contributionAmount ?? viewModel.contributionAmount;
  const frequencyLabel = t(frequencyLabelKey(group.frequency));
  const myStatusKey = viewModel.statusKey;

  const virtualAccount = group.myDetails?.virtualAccountNumber;
  const virtualBank = group.myDetails?.virtualBankName;
  const hasVirtualAccount = Boolean(virtualAccount);

  const sortedMembers = useMemo(
    () =>
      [...group.members].sort((a, b) => {
        const turnA = a.payoutTurn ?? Number.MAX_SAFE_INTEGER;
        const turnB = b.payoutTurn ?? Number.MAX_SAFE_INTEGER;
        return turnA - turnB;
      }),
    [group.members],
  );

  const stats = useMemo(() => computeLedgerStats(sortedMembers), [sortedMembers]);

  const handleCopyAccount = useCallback(async () => {
    if (!virtualAccount) return;

    await Clipboard.setStringAsync(virtualAccount);
    setCopiedAccount(true);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopiedAccount(false);
      copyTimeoutRef.current = null;
    }, 2000);
  }, [virtualAccount]);

  const handleGoToPayout = useCallback(() => {
    Alert.alert(
      t("home.firstTime.actions.help.title"),
      t("groups.ledger.payoutComingSoon"),
    );
  }, [t]);

  const weekPaymentLabel = t("groups.ledger.weekPayment", { week: currentWeek });
  const paymentSectionTitle = isAdmin
    ? t("groups.ledger.adminPaymentTitle")
    : t("groups.ledger.weekContributionTitle", { week: currentWeek });

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={LOGO_MARK}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>

      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <AjoLedgerLogoMark size={42} variant="square" />
          <View style={styles.overviewTitleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t("groups.ledger.active")}</Text>
              </View>
            </View>
            <Text style={styles.cycleLine}>
              {t("groups.ledger.cycleLine", {
                frequency: frequencyLabel,
                amount: formatNaira(contributionAmount),
              })}
            </Text>
          </View>
        </View>

        <View style={styles.overviewMeta}>
          <View style={styles.metaItem}>
            <View style={styles.metaIconWrap}>
              <Ionicons name="receipt-outline" size={20} color={theme.colors.payoutIcon} />
            </View>
            <Text style={styles.metaValue}>
              {t("groups.ledger.weekProgress", {
                current: currentWeek,
                total: totalWeeks,
              })}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>{t("groups.ledger.dueDate")}</Text>
            <Text style={styles.metaValueSmall}>
              {dueDate ? formatShortDate(dueDate) : "—"}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaColumnWide}>
            <Text style={styles.metaLabel}>{t("groups.ledger.expectedAmount")}</Text>
            <Text style={styles.metaValueSmall}>
              {expectedAmount > 0 ? formatNaira(expectedAmount) : "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>{paymentSectionTitle}</Text>
        <View style={styles.paymentRow}>
          <View style={styles.paymentCol}>
            <Text style={styles.paymentLabel}>
              {t("groups.ledger.myContributionStatus")}
            </Text>
            <Text style={styles.paymentSubLabel}>{weekPaymentLabel}</Text>
            <Text
              style={[
                styles.paymentStatus,
                { color: statusColor(theme, myStatusKey).text },
              ]}
            >
              {t(`groups.list.status.${myStatusKey}`)}
            </Text>
            <Text style={styles.paymentAmount}>
              {formatNaira(contributionAmount)}
            </Text>
            {dueDate ? (
              <Text style={styles.paymentDue}>
                {formatShortDate(dueDate)}
              </Text>
            ) : null}
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentCol}>
            <Text style={styles.paymentLabel}>
              {t("groups.ledger.virtualAccountTitle")}
            </Text>
            {hasVirtualAccount ? (
              <>
                {virtualBank ? (
                  <Text style={styles.bankLine}>
                    {t("groups.ledger.bankLine", {
                      bank: virtualBank,
                      account: virtualAccount,
                    })}
                  </Text>
                ) : (
                  <Text style={styles.accountNumber}>{virtualAccount}</Text>
                )}
                <Pressable
                  onPress={() => void handleCopyAccount()}
                  accessibilityRole="button"
                  accessibilityLabel={t("groups.detail.copyAccount")}
                  style={({ pressed }) => [
                    styles.copyButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.copyButtonText}>{t("groups.ledger.copy")}</Text>
                </Pressable>
                {copiedAccount ? (
                  <Text style={styles.copiedHint}>{t("groups.invite.copied")}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.accountPending}>
                {t("groups.detail.accountPending")}
              </Text>
            )}
          </View>
        </View>

        {isAdmin ? (
          <Button
            label={t("groups.ledger.goToPayout")}
            onPress={handleGoToPayout}
            style={styles.payoutButton}
          />
        ) : null}
      </View>

      {isAdmin ? (
        <>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statCount}>{stats.paid}</Text>
              <Text style={styles.statLabel}>{t("groups.list.status.paid")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statCount}>{stats.pending}</Text>
              <Text style={styles.statLabel}>{t("groups.ledger.pending")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statCount}>{stats.partial}</Text>
              <Text style={styles.statLabel}>{t("groups.list.status.partial")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItemWide}>
              <Text style={styles.statCount}>{stats.total}</Text>
              <Text style={styles.statLabel}>{t("groups.ledger.totalMembers")}</Text>
            </View>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.memberHeader]}>
                {t("groups.ledger.memberColumn")}
              </Text>
              <Text style={[styles.tableHeaderText, styles.dueHeader]}>
                {t("groups.ledger.dueAmountColumn")}
              </Text>
              <Text style={[styles.tableHeaderText, styles.statusHeader]}>
                {t("groups.list.statusLabel")}
              </Text>
            </View>
            {sortedMembers.map((member, index) => (
              <LedgerMemberRow
                key={member.id}
                member={member}
                index={index}
                contributionAmount={contributionAmount}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.activitySection}>
          <Text style={styles.activityHeading}>{t("groups.ledger.updates")}</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIconPaid}>
              <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>
                {t("home.activity.paymentPaid.title")}
              </Text>
              <Text style={styles.activitySubtitle}>
                {t("home.activity.paymentPaid.subtitle", {
                  amount: formatNaira(contributionAmount),
                })}
              </Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <View style={styles.activityIconReminder}>
              <Ionicons name="notifications-outline" size={16} color={theme.colors.surface} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>
                {t("home.activity.contributionReminder.title")}
              </Text>
              <Text style={styles.activitySubtitle}>
                {t("home.activity.contributionReminder.subtitle")}
              </Text>
            </View>
          </View>
          {viewModel.position > 0 ? (
            <View style={styles.activityCard}>
              <View style={styles.activityIconPayout}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textPrimary} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>
                  {t("groups.ledger.myPayoutTime")}
                </Text>
                <Text style={styles.activitySubtitle}>
                  {t("groups.detail.payoutPosition", {
                    position: formatOrdinal(viewModel.position),
                  })}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    logoWrap: {
      alignItems: "center",
    },
    logo: {
      width: 50,
      height: 50,
    },
    overviewCard: {
      backgroundColor: theme.colors.savingsCardBg,
      borderWidth: 1,
      borderColor: theme.colors.payoutIconBgAlt,
      borderRadius: 10,
      padding: 15,
      gap: 20,
    },
    overviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    overviewTitleBlock: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    groupName: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      flexShrink: 1,
    },
    activeBadge: {
      backgroundColor: theme.colors.successMuted,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    activeBadgeText: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.successDark,
    },
    cycleLine: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    overviewMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      maxWidth: 120,
    },
    metaIconWrap: {
      backgroundColor: theme.colors.payoutIconBg,
      borderRadius: 30,
      padding: 6,
    },
    metaColumn: {
      gap: 4,
      width: 71,
    },
    metaColumnWide: {
      gap: 4,
      flex: 1,
      maxWidth: 112,
    },
    metaLabel: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    metaValue: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    metaValueSmall: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    metaDivider: {
      width: 1,
      height: 39,
      backgroundColor: theme.colors.cardBorderMuted,
    },
    paymentCard: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      padding: 10,
      gap: 12,
    },
    sectionTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    paymentRow: {
      flexDirection: "row",
      gap: 12,
    },
    paymentCol: {
      flex: 1,
      gap: 4,
    },
    paymentLabel: {
      fontSize: 12,
      lineHeight: 14,
      color: theme.colors.textSecondary,
    },
    paymentSubLabel: {
      fontSize: 12,
      lineHeight: 14,
      color: theme.colors.textPrimary,
    },
    paymentStatus: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
    },
    paymentAmount: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    paymentDue: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textSecondary,
    },
    paymentDivider: {
      width: 1,
      backgroundColor: theme.colors.cardBorderMuted,
    },
    bankLine: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    accountNumber: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    },
    copyButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.brand,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 4,
    },
    copyButtonText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    copiedHint: {
      fontSize: 12,
      color: theme.colors.successDark,
    },
    accountPending: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textMuted,
    },
    payoutButton: {
      marginTop: 4,
    },
    statsCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      padding: 10,
    },
    statItem: {
      alignItems: "center",
      width: 66,
      gap: 4,
    },
    statItemWide: {
      alignItems: "center",
      width: 86,
      gap: 4,
    },
    statCount: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    statDivider: {
      width: 1,
      height: 39,
      backgroundColor: theme.colors.cardBorderMuted,
    },
    tableCard: {
      borderWidth: 1,
      borderColor: theme.colors.cardBorderMuted,
      borderRadius: 10,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: theme.colors.progressNeutralBg,
    },
    tableHeaderText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    memberHeader: {
      flex: 1.4,
    },
    dueHeader: {
      width: 72,
      textAlign: "center",
    },
    statusHeader: {
      width: 72,
      textAlign: "right",
    },
    activitySection: {
      gap: theme.spacing.sm,
    },
    activityHeading: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    activityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.activityListBorder,
      borderRadius: 10,
      padding: 10,
      backgroundColor: theme.colors.surface,
    },
    activityIconPaid: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.activityPaidBg,
      alignItems: "center",
      justifyContent: "center",
    },
    activityIconReminder: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.activityReminderBg,
      alignItems: "center",
      justifyContent: "center",
    },
    activityIconPayout: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.activityPayoutBg,
      alignItems: "center",
      justifyContent: "center",
    },
    activityText: {
      flex: 1,
      gap: 2,
    },
    activityTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    },
    activitySubtitle: {
      fontSize: 12,
      lineHeight: 14,
      color: theme.colors.textSecondary,
    },
    pressed: {
      opacity: 0.85,
    },
  });

const createMemberRowStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.activityListBorder,
      gap: 8,
    },
    memberCol: {
      flex: 1.4,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      color: theme.colors.surface,
    },
    memberText: {
      flex: 1,
      minWidth: 0,
    },
    memberName: {
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    position: {
      fontSize: 10,
      lineHeight: 14,
      color: theme.colors.textMuted,
    },
    dueCol: {
      width: 72,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
      color: theme.colors.textPrimary,
    },
    statusBadge: {
      width: 72,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: "center",
    },
    statusText: {
      fontSize: 10,
      lineHeight: 12,
      fontFamily: theme.fontFamily.semibold,
    },
  });
