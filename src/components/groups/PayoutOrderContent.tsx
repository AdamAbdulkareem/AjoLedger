import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import {
  getMemberAvatarColor,
  getMemberInitials,
} from "../../lib/memberAvatar";
import type { GroupMember } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

const LOGO_MARK = require("../../../assets/groups/ajoledger-logo-mark.png");

type PayoutOrderContentProps = {
  members: GroupMember[];
  slotsTotal: number;
  submitting?: boolean;
  onStartContribution: (orderedMembershipIds: string[]) => void;
};

type MemberRowProps = {
  member: GroupMember;
  index: number;
  turn: number | null;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
};

function MemberRow({
  member,
  index,
  turn,
  isFirst,
  isLast,
  onPress,
}: MemberRowProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const initials = getMemberInitials(member.name);
  const avatarColor = getMemberAvatarColor(index);
  const isAssigned = turn != null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isAssigned
          ? t("groups.payoutOrder.memberAssignedA11y", {
              name: member.name,
              turn,
            })
          : t("groups.payoutOrder.memberUnassignedA11y", { name: member.name })
      }
      style={({ pressed }) => [
        styles.memberRow,
        isFirst && styles.memberRowFirst,
        isLast && styles.memberRowLast,
        !isFirst && styles.memberRowDivider,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.memberIdentity}>
        <View
          style={[
            styles.turnBadge,
            isAssigned ? styles.turnBadgeActive : styles.turnBadgeInactive,
          ]}
        >
          {isAssigned ? (
            <Text style={styles.turnBadgeText}>{turn}</Text>
          ) : null}
        </View>

        <View style={styles.memberMeta}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.memberName} numberOfLines={1}>
            {member.name}
          </Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <View
          style={[styles.statusDot, { backgroundColor: theme.colors.groupCreateBg }]}
        />
        <Text style={styles.statusLabel}>{t("groups.invite.statusJoined")}</Text>
      </View>
    </Pressable>
  );
}

function buildInitialOrder(members: GroupMember[]): string[] {
  const withTurns = members
    .filter(
      (member): member is GroupMember & { payoutTurn: number } =>
        typeof member.payoutTurn === "number" && member.payoutTurn > 0,
    )
    .sort((a, b) => a.payoutTurn - b.payoutTurn);

  if (withTurns.length === 0) {
    return [];
  }

  return withTurns.map((member) => member.id);
}

export function PayoutOrderContent({
  members,
  slotsTotal,
  submitting = false,
  onStartContribution,
}: PayoutOrderContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    buildInitialOrder(members),
  );

  useEffect(() => {
    setOrderedIds(buildInitialOrder(members));
  }, [members]);

  const turnById = useMemo(() => {
    const map = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      map.set(id, index + 1);
    });
    return map;
  }, [orderedIds]);

  const allAssigned =
    members.length > 0 && orderedIds.length === members.length;

  const handleMemberPress = useCallback((memberId: string) => {
    setOrderedIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((id) => id !== memberId);
      }
      return [...current, memberId];
    });
  }, []);

  const handleStart = useCallback(() => {
    if (!allAssigned) {
      Alert.alert(
        t("groups.payoutOrder.incompleteTitle"),
        t("groups.payoutOrder.incompleteBody"),
      );
      return;
    }
    onStartContribution(orderedIds);
  }, [allAssigned, onStartContribution, orderedIds, t]);

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

      <View style={styles.intro}>
        <Text style={styles.introTitle}>
          {t("groups.payoutOrder.assignTitle")}
        </Text>
        <Text style={styles.introBody}>
          {t("groups.payoutOrder.assignBody")}
        </Text>
      </View>

      <View style={styles.membersSection}>
        <View style={styles.membersHeader}>
          <Text style={styles.membersTitle}>
            {t("groups.payoutOrder.membersTitle", { count: members.length })}
          </Text>
          <Text style={styles.slotsFilled}>
            {t("groups.payoutOrder.slotsFilled", {
              joined: members.length,
              total: Math.max(slotsTotal, members.length),
            })}
          </Text>
        </View>

        <View style={styles.membersList}>
          {members.length === 0 ? (
            <View
              style={[
                styles.memberRow,
                styles.memberRowFirst,
                styles.memberRowLast,
              ]}
            >
              <Text style={styles.emptyMembers}>
                {t("groups.payoutOrder.noMembers")}
              </Text>
            </View>
          ) : (
            members.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                index={index}
                turn={turnById.get(member.id) ?? null}
                isFirst={index === 0}
                isLast={index === members.length - 1}
                onPress={() => handleMemberPress(member.id)}
              />
            ))
          )}
        </View>
      </View>

      <Button
        label={t("groups.payoutOrder.startContribution")}
        onPress={handleStart}
        iconRight="arrow-forward"
        size="compact"
        loading={submitting}
        disabled={submitting}
        style={[
          styles.ctaButton,
          !allAssigned && !submitting ? styles.ctaButtonInactive : null,
        ]}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    logoWrap: {
      alignItems: "center",
      marginTop: theme.spacing.xs,
    },
    logo: {
      width: 50,
      height: 50,
    },
    intro: {
      alignItems: "center",
      gap: 4,
      paddingHorizontal: theme.spacing.xl + 8,
    },
    introTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    introBody: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    membersSection: {
      gap: 12,
      flex: 1,
    },
    membersHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 6,
      gap: theme.spacing.sm,
    },
    membersTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: theme.colors.textPrimary,
    },
    slotsFilled: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.textPrimary,
    },
    membersList: {
      width: "100%",
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
      borderColor: theme.colors.cardBorderMuted,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
    },
    memberRowFirst: {
      borderTopWidth: 1,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    memberRowLast: {
      borderBottomWidth: 1,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    memberRowDivider: {
      borderBottomWidth: 1,
    },
    memberIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
    },
    turnBadge: {
      width: 15,
      height: 15,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    turnBadgeInactive: {
      backgroundColor: theme.colors.payoutIconBg,
    },
    turnBadgeActive: {
      backgroundColor: theme.colors.brand,
    },
    turnBadgeText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 10,
      lineHeight: 12,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    memberMeta: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 18,
      lineHeight: 28,
      color: theme.colors.textPrimary,
    },
    memberName: {
      flex: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      color: theme.colors.textPrimary,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.successMuted,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    statusLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      color: theme.colors.groupCreateBg,
    },
    emptyMembers: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
      flex: 1,
    },
    ctaButton: {
      alignSelf: "center",
      minWidth: 283,
      maxWidth: "100%",
      marginTop: "auto",
    },
    ctaButtonInactive: {
      backgroundColor: theme.colors.payoutIconBgAlt,
      opacity: 1,
    },
    pressed: {
      opacity: 0.88,
    },
  });
