import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import {
  buildGroupListCardViewModel,
  mapContributionStatusKey,
} from "../../lib/buildGroupListCardViewModel";
import {
  readCycleContributionStatus,
  resolveGrossTransferBreakdown,
} from "../../lib/contributionPayment";
import { formatNaira } from "../../lib/formatMoney";
import { usePaymentStatusPolling } from "../../hooks/usePaymentStatusPolling";
import type { ContributionFrequency, GroupDetails } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupDetailContentProps = {
  group: GroupDetails;
  accessToken?: string | null;
  onPaymentConfirmed?: () => void;
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

export function GroupDetailContent({
  group,
  accessToken,
  onPaymentConfirmed,
}: GroupDetailContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedTransferAmount, setCopiedTransferAmount] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transferCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewModel = buildGroupListCardViewModel(group);
  const cycle = group.cycleDetails;
  const contributionAmount =
    group.contributionAmount ?? cycle?.contributionAmount ?? viewModel.contributionAmount;
  const { netContribution, grossTransfer, processingFee } = resolveGrossTransferBreakdown(
    cycle,
    contributionAmount ?? 0,
  );
  const contributionLine =
    contributionAmount != null
      ? t("groups.list.contributionLine", {
          amount: formatNaira(contributionAmount),
          frequency: t(frequencyLabelKey(group.frequency)),
        })
      : null;

  const virtualAccount = group.myDetails?.virtualAccountNumber;
  const virtualBank = group.myDetails?.virtualBankName;
  const virtualAccountName = group.myDetails?.virtualAccountName;
  const hasVirtualAccount = !!virtualAccount;

  const statusRaw = readCycleContributionStatus(cycle, group.myDetails);
  const statusKey = statusRaw ? mapContributionStatusKey(statusRaw) : null;
  const isPaid = statusKey === "paid";
  const showFeeBreakdown = !isPaid && processingFee > 0;

  const { waiting, timedOut, startWaiting } = usePaymentStatusPolling({
    accessToken: accessToken ?? null,
    groupId: group.id,
    enabled: !isPaid && !!accessToken,
    onPaid: () => onPaymentConfirmed?.(),
  });

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

  const handleCopyTransferAmount = useCallback(async () => {
    if (grossTransfer <= 0) return;

    await Clipboard.setStringAsync(String(grossTransfer));
    setCopiedTransferAmount(true);

    if (transferCopyTimeoutRef.current) {
      clearTimeout(transferCopyTimeoutRef.current);
    }

    transferCopyTimeoutRef.current = setTimeout(() => {
      setCopiedTransferAmount(false);
      transferCopyTimeoutRef.current = null;
    }, 2000);
  }, [grossTransfer]);

  const position = group.myDetails?.position;

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.groupName}>{group.name}</Text>
        {group.description ? (
          <Text style={styles.description}>{group.description}</Text>
        ) : null}
        {contributionLine ? (
          <Text style={styles.contribution}>{contributionLine}</Text>
        ) : null}
        {group.numberOfParticipants > 0 ? (
          <Text style={styles.progress}>
            {t("groups.invite.joinedProgress", {
              joined: group.joinedCount,
              total: group.numberOfParticipants,
            })}
          </Text>
        ) : null}
      </View>

      {position != null || statusKey ? (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t("groups.detail.membershipTitle")}</Text>
          {position != null ? (
            <Text style={styles.infoRow}>
              {t("groups.detail.payoutPosition", { position })}
            </Text>
          ) : (
            <Text style={styles.infoMuted}>{t("groups.detail.payoutPending")}</Text>
          )}
          {statusKey ? (
            <Text style={styles.statusBadge}>
              {t(`groups.list.status.${statusKey}`)}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>{t("groups.detail.payInTitle")}</Text>
        <Text style={styles.cardSubtitle}>{t("groups.detail.payInBody")}</Text>

        {showFeeBreakdown ? (
          <View style={styles.feeBreakdown}>
            <Text style={styles.feeLine}>
              {t("groups.ledger.contributionAmount", {
                amount: formatNaira(netContribution),
              })}
            </Text>
            <Text style={styles.feeLine}>
              {t("groups.ledger.processingFee", {
                amount: formatNaira(processingFee),
              })}
            </Text>
            <Text style={styles.transferAmount}>
              {t("groups.ledger.transferAmount", {
                amount: formatNaira(grossTransfer),
              })}
            </Text>
            <Pressable
              onPress={() => void handleCopyTransferAmount()}
              accessibilityRole="button"
              accessibilityLabel={t("groups.ledger.copyTransferAmount")}
              style={({ pressed }) => [styles.copyLink, pressed && styles.pressed]}
            >
              <Text style={styles.copyLinkText}>
                {t("groups.ledger.copyTransferAmount")}
              </Text>
            </Pressable>
            {copiedTransferAmount ? (
              <Text style={styles.copiedHint}>{t("groups.invite.copied")}</Text>
            ) : null}
          </View>
        ) : null}

        {hasVirtualAccount ? (
          <>
            {virtualBank ? (
              <Text style={styles.bankName}>{virtualBank}</Text>
            ) : null}
            {virtualAccountName ? (
              <Text style={styles.accountName}>{virtualAccountName}</Text>
            ) : null}
            <View style={styles.accountRow}>
              <Text style={styles.accountNumber} accessibilityLabel={virtualAccount}>
                {virtualAccount}
              </Text>
              <Pressable
                onPress={() => void handleCopyAccount()}
                accessibilityRole="button"
                accessibilityLabel={t("groups.detail.copyAccount")}
                style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
              >
                <Ionicons name="copy-outline" size={20} color={theme.colors.textPrimary} />
              </Pressable>
            </View>
            {copiedAccount ? (
              <Text style={styles.copiedHint}>{t("groups.invite.copied")}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.infoMuted}>{t("groups.detail.accountPending")}</Text>
        )}

        {!isPaid && hasVirtualAccount ? (
          waiting ? (
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={theme.colors.brand} />
              <Text style={styles.waitingText}>
                {t("groups.ledger.waitingForPayment")}
              </Text>
            </View>
          ) : (
            <Button
              label={t("groups.ledger.transferredButton")}
              onPress={startWaiting}
              variant="secondary"
            />
          )
        ) : null}

        {timedOut ? (
          <View style={styles.timedOutBlock}>
            <Text style={styles.timedOutText}>{t("groups.ledger.paymentTimedOut")}</Text>
            <Button
              label={t("groups.ledger.retryPaymentCheck")}
              onPress={startWaiting}
              variant="secondary"
              size="compact"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    headerBlock: {
      gap: theme.spacing.sm,
    },
    groupName: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 22,
      lineHeight: 28,
      color: theme.colors.textPrimary,
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    contribution: {
      ...theme.typography.body,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    progress: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 16,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    cardTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    cardSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    feeBreakdown: {
      gap: 4,
    },
    feeLine: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    transferAmount: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    copyLink: {
      alignSelf: "flex-start",
    },
    copyLinkText: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
    },
    waitingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    waitingText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    timedOutBlock: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    timedOutText: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    bankName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    accountName: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
    },
    accountNumber: {
      flex: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      letterSpacing: 0.5,
    },
    copyButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    copiedHint: {
      ...theme.typography.caption,
      color: theme.colors.successDark,
    },
    infoRow: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    infoMuted: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    statusBadge: {
      alignSelf: "flex-start",
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
      backgroundColor: theme.colors.successMuted,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.85,
    },
  });
