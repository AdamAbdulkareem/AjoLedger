import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { Button } from "../Button";
import { formatInviteCodeDisplay } from "../../lib/groupInviteLink";
import type { GroupInviteMember } from "../../lib/groupMembers";
import {
  getMemberAvatarColor,
  getMemberInitials,
} from "../../lib/memberAvatar";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupInviteContentProps = {
  inviteCode: string;
  members: GroupInviteMember[];
  onCheckPayoutOrder: () => void;
};

type InviteMemberRowProps = {
  member: GroupInviteMember;
  index: number;
  isFirst: boolean;
  isLast: boolean;
};

function InviteMemberRow({
  member,
  index,
  isFirst,
  isLast,
}: InviteMemberRowProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const initials = getMemberInitials(member.name);
  const avatarColor = getMemberAvatarColor(index);

  return (
    <Animated.View
      entering={FadeInDown.delay(320 + index * 70)
        .springify()
        .damping(18)}
      style={[
        styles.memberRow,
        isFirst && styles.memberRowFirst,
        isLast && styles.memberRowLast,
        !isFirst && styles.memberRowDivider,
      ]}
    >
      <View style={styles.memberIdentity}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.memberName} numberOfLines={1}>
          {member.name}
        </Text>
      </View>

      <View style={styles.statusBadge}>
        <View
          style={[styles.statusDot, { backgroundColor: theme.colors.groupCreateBg }]}
        />
        <Text style={styles.statusLabel}>{t("groups.invite.statusJoined")}</Text>
      </View>
    </Animated.View>
  );
}

export function GroupInviteContent({
  inviteCode,
  members,
  onCheckPayoutOrder,
}: GroupInviteContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyScale = useSharedValue(1);

  const displayCode = formatInviteCodeDisplay(inviteCode);

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    copyScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 2000);
  }, [copyScale, inviteCode]);

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.delay(80).springify().damping(20)}
        style={styles.inviteCard}
      >
        <View style={styles.qrIconWrap}>
          <View style={styles.qrIconCircle}>
            <Ionicons name="qr-code-outline" size={28} color={theme.colors.brand} />
          </View>
        </View>

        <Text style={styles.shareHint}>{t("groups.invite.shareCodeHint")}</Text>

        <Pressable
          onPress={() => void handleCopy()}
          accessibilityRole="button"
          accessibilityLabel={t("groups.invite.copyCode")}
          style={({ pressed }) => [
            styles.codePill,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.codeValue} accessibilityLabel={displayCode}>
            {displayCode}
          </Text>
          <Animated.View style={copyAnimatedStyle}>
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={20}
              color={theme.colors.brand}
            />
          </Animated.View>
        </Pressable>

        {copied ? (
          <Animated.Text
            entering={FadeInDown.duration(200)}
            style={styles.copiedHint}
          >
            {t("groups.invite.copied")}
          </Animated.Text>
        ) : null}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(180).springify().damping(20)}
        style={styles.membersSection}
      >
        <Text style={styles.membersTitle}>
          {t("groups.invite.membersTitle", { count: members.length })}
        </Text>

        <View style={styles.membersList}>
          {members.length === 0 ? (
            <View style={[styles.memberRow, styles.memberRowFirst, styles.memberRowLast]}>
              <Text style={styles.emptyMembers}>{t("groups.invite.noMembersYet")}</Text>
            </View>
          ) : (
            members.map((member, index) => (
              <InviteMemberRow
                key={member.id}
                member={member}
                index={index}
                isFirst={index === 0}
                isLast={index === members.length - 1}
              />
            ))
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(20)}>
        <Button
          label={t("groups.invite.checkPayoutOrder")}
          onPress={onCheckPayoutOrder}
          iconRight="arrow-forward"
          size="compact"
          style={styles.ctaButton}
        />
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    inviteCard: {
      backgroundColor: theme.colors.carouselCardBg,
      borderWidth: 1,
      borderColor: theme.colors.inviteCardBorder,
      borderRadius: 20,
      padding: theme.spacing.md,
      alignItems: "center",
      gap: 20,
    },
    qrIconWrap: {
      alignItems: "center",
    },
    qrIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.payoutIconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    shareHint: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textMuted,
      textAlign: "center",
      maxWidth: 198,
    },
    codePill: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.activityListBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
      gap: theme.spacing.sm,
    },
    codeValue: {
      flex: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "700",
      color: theme.colors.brand,
      letterSpacing: 0.5,
    },
    copiedHint: {
      ...theme.typography.caption,
      color: theme.colors.successDark,
      marginTop: -8,
    },
    membersSection: {
      gap: theme.spacing.sm + 4,
    },
    membersTitle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
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
      paddingVertical: theme.spacing.sm,
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
      gap: theme.spacing.xs,
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
    },
    pressed: {
      opacity: 0.88,
    },
  });
