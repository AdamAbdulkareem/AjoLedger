import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";

import { formatNaira } from "../../lib/formatMoney";
import type { ContributionFrequency, GroupDetails } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupDetailContentProps = {
  group: GroupDetails;
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

export function GroupDetailContent({ group }: GroupDetailContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contributionAmount =
    group.contributionAmount ?? group.cycleDetails?.contributionAmount;
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

  const position = group.myDetails?.position;
  const status = group.myDetails?.status;

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

      {position != null || status ? (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t("groups.detail.membershipTitle")}</Text>
          {position != null ? (
            <Text style={styles.infoRow}>
              {t("groups.detail.payoutPosition", { position })}
            </Text>
          ) : (
            <Text style={styles.infoMuted}>{t("groups.detail.payoutPending")}</Text>
          )}
          {status ? (
            <Text style={styles.statusBadge}>{status}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>{t("groups.detail.payInTitle")}</Text>
        <Text style={styles.cardSubtitle}>{t("groups.detail.payInBody")}</Text>

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
