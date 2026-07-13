import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import {
  buildPayoutScheduleViewModel,
  type CompletedPayoutRow,
  type PayoutScheduleRow,
} from "../../lib/buildPayoutSchedule";
import { formatShortDate } from "../../lib/formatDate";
import { formatNaira } from "../../lib/formatMoney";
import { getMemberAvatarColor, getMemberInitials } from "../../lib/memberAvatar";
import type { GroupDetails } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type PayoutContentProps = {
  group: GroupDetails;
  pendingRound?: number | null;
  disbursing?: boolean;
  pollTimedOut?: boolean;
  onConfirmPress: () => void;
  onRetryPoll?: () => void;
};

function ScheduleStatusBadge({
  status,
  styles,
  theme,
}: {
  status: PayoutScheduleRow["status"];
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
}) {
  const { t } = useTranslation();

  if (status === "next") {
    return (
      <View style={styles.nextBadge}>
        <View style={[styles.nextDot, { backgroundColor: theme.colors.payoutIcon }]} />
        <Text style={styles.nextBadgeText}>{t("groups.payout.scheduleNext")}</Text>
      </View>
    );
  }

  if (status === "processing") {
    return (
      <View style={styles.processingBadge}>
        <ActivityIndicator size="small" color={theme.colors.payoutIcon} />
        <Text style={styles.processingText}>{t("groups.payout.scheduleProcessing")}</Text>
      </View>
    );
  }

  return <Text style={styles.upcomingText}>{t("groups.payout.scheduleUpcoming")}</Text>;
}

function PayoutMemberRow({
  row,
  index,
  isFirst,
  isLast,
  payoutAmount,
  styles,
  theme,
}: {
  row: PayoutScheduleRow | CompletedPayoutRow;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  payoutAmount: number;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
}) {
  const { t } = useTranslation();
  const payoutTurn = row.payoutTurn;
  const member = row.member;
  const scheduleStatus = "status" in row ? row.status : null;
  const isNext = scheduleStatus === "next" || scheduleStatus === "processing";

  return (
    <View
      style={[
        styles.scheduleRow,
        isFirst && styles.scheduleRowFirst,
        isLast && styles.scheduleRowLast,
      ]}
    >
      <View style={styles.scheduleLeft}>
        <View
          style={[
            styles.positionBadge,
            isNext ? styles.positionBadgeNext : styles.positionBadgeUpcoming,
          ]}
        >
          <Text style={styles.positionBadgeText}>{payoutTurn}</Text>
        </View>

        <View
          style={[styles.avatar, { backgroundColor: getMemberAvatarColor(index) }]}
        >
          <Text style={styles.avatarText}>{getMemberInitials(member.name)}</Text>
        </View>

        <View style={styles.memberText}>
          <Text style={styles.memberName} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={styles.memberAmount}>{formatNaira(payoutAmount)}</Text>
        </View>
      </View>

      {"status" in row ? (
        <ScheduleStatusBadge status={row.status} styles={styles} theme={theme} />
      ) : (
        <Text style={styles.completedText}>{t("groups.payout.scheduleCompleted")}</Text>
      )}
    </View>
  );
}

export function PayoutContent({
  group,
  pendingRound = null,
  disbursing = false,
  pollTimedOut = false,
  onConfirmPress,
  onRetryPoll,
}: PayoutContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const viewModel = useMemo(
    () => buildPayoutScheduleViewModel(group, { pendingRound }),
    [group, pendingRound],
  );

  const payoutAmount = viewModel.potTarget;

  const recipient = viewModel.nextRecipient;
  const canPressConfirm = viewModel.canDisburse && !disbursing;
  const showInactiveButton = !viewModel.canDisburse || viewModel.isProcessing || disbursing;

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

      <View style={styles.readyCard}>
        <Text style={styles.readyLabel}>{t("groups.payout.readyTitle")}</Text>

        {recipient ? (
          <View style={styles.recipientRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.progressNeutral }]}>
              <Text style={styles.avatarText}>{getMemberInitials(recipient.name)}</Text>
            </View>
            <View style={styles.recipientText}>
              <Text style={styles.recipientName} numberOfLines={2}>
                {recipient.name}
              </Text>
              <Text style={styles.recipientMeta}>
                {t("groups.payout.positionDue", {
                  position: viewModel.currentRound,
                  date: formatShortDate(viewModel.dueDate),
                })}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyRecipient}>{t("groups.payout.noRecipient")}</Text>
        )}

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>{t("groups.payout.amountLabel")}</Text>
          <Text style={styles.amountValue}>{formatNaira(payoutAmount)}</Text>
        </View>

        <Pressable
          onPress={canPressConfirm ? onConfirmPress : undefined}
          disabled={!canPressConfirm}
          accessibilityRole="button"
          accessibilityLabel={t("groups.payout.confirmButton")}
          accessibilityState={{ disabled: !canPressConfirm, busy: disbursing }}
          style={({ pressed }) => [
            styles.confirmButton,
            showInactiveButton ? styles.confirmButtonInactive : styles.confirmButtonActive,
            pressed && canPressConfirm && styles.pressed,
          ]}
        >
          {disbursing ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <>
              <Ionicons
                name="people-outline"
                size={20}
                color={theme.colors.textPrimary}
              />
              <Text
                style={[
                  styles.confirmLabel,
                  showInactiveButton && styles.confirmLabelInactive,
                ]}
              >
                {viewModel.isProcessing
                  ? t("groups.payout.processingButton")
                  : t("groups.payout.confirmButton")}
              </Text>
            </>
          )}
        </Pressable>

        {!viewModel.allMembersPaid && !viewModel.isProcessing ? (
          <Text style={styles.hint}>{t("groups.payout.waitingForContributions")}</Text>
        ) : null}

        {pollTimedOut ? (
          <View style={styles.timedOutBlock}>
            <Text style={styles.timedOutText}>{t("groups.payout.pollTimedOut")}</Text>
            {onRetryPoll ? (
              <Pressable
                onPress={onRetryPoll}
                accessibilityRole="button"
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <Text style={styles.retryButtonText}>
                  {t("groups.payout.retryPoll")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t("groups.payout.scheduleTitle")}</Text>
      <View style={styles.scheduleCard}>
        {viewModel.scheduleRows.length === 0 ? (
          <Text style={styles.emptySchedule}>{t("groups.payout.emptySchedule")}</Text>
        ) : (
          viewModel.scheduleRows.map((row, index) => (
            <PayoutMemberRow
              key={row.member.id}
              row={row}
              index={index}
              isFirst={index === 0}
              isLast={index === viewModel.scheduleRows.length - 1}
              payoutAmount={payoutAmount}
              styles={styles}
              theme={theme}
            />
          ))
        )}
      </View>

      {viewModel.completedRows.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t("groups.payout.completedTitle")}</Text>
          <View style={styles.scheduleCard}>
            {viewModel.completedRows.map((row, index) => (
              <PayoutMemberRow
                key={`completed-${row.member.id}`}
                row={row}
                index={index}
                isFirst={index === 0}
                isLast={index === viewModel.completedRows.length - 1}
                payoutAmount={payoutAmount}
                styles={styles}
                theme={theme}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    logoWrap: {
      alignItems: "center",
      paddingTop: 4,
    },
    logo: {
      width: 50,
      height: 50,
    },
    readyCard: {
      backgroundColor: theme.colors.savingsCardBg,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 16,
    },
    readyLabel: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    recipientRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    recipientText: {
      flex: 1,
      gap: 4,
    },
    recipientName: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    recipientMeta: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    emptyRecipient: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    amountBox: {
      backgroundColor: theme.colors.progressUrgentBg,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 4,
      opacity: 0.9,
    },
    amountLabel: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    amountValue: {
      ...theme.typography.progressStat,
      fontSize: 24,
      lineHeight: 28,
      color: theme.colors.brand,
    },
    confirmButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 12,
      minHeight: 48,
    },
    confirmButtonActive: {
      backgroundColor: theme.colors.brand,
    },
    confirmButtonInactive: {
      backgroundColor: theme.colors.payoutIconBgAlt,
    },
    confirmLabel: {
      ...theme.typography.button,
      color: theme.colors.textPrimary,
    },
    confirmLabelInactive: {
      color: theme.colors.textSecondary,
    },
    pressed: {
      opacity: 0.85,
    },
    hint: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    timedOutBlock: {
      gap: theme.spacing.sm,
      alignItems: "center",
    },
    timedOutText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    retryButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    retryButtonText: {
      ...theme.typography.captionMedium,
      color: theme.colors.brand,
    },
    sectionTitle: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    scheduleCard: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
    },
    scheduleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.inputBorder,
      gap: 8,
    },
    scheduleRowFirst: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    scheduleRowLast: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    scheduleLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    positionBadge: {
      width: 15,
      height: 15,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    positionBadgeNext: {
      backgroundColor: theme.colors.brand,
    },
    positionBadgeUpcoming: {
      backgroundColor: theme.colors.payoutIconBg,
    },
    positionBadgeText: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
      fontSize: 10,
      lineHeight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
    },
    memberText: {
      flex: 1,
      gap: 2,
    },
    memberName: {
      ...theme.typography.captionMedium,
      color: theme.colors.textPrimary,
    },
    memberAmount: {
      ...theme.typography.micro,
      color: theme.colors.textMuted,
    },
    nextBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.savingsCardBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    nextDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    nextBadgeText: {
      ...theme.typography.captionMedium,
      color: theme.colors.payoutIcon,
    },
    processingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    processingText: {
      ...theme.typography.captionMedium,
      color: theme.colors.payoutIcon,
    },
    upcomingText: {
      ...theme.typography.captionMedium,
      color: theme.colors.textMuted,
    },
    completedText: {
      ...theme.typography.captionMedium,
      color: theme.colors.successDark,
    },
    emptySchedule: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      padding: 16,
      textAlign: "center",
    },
  });
