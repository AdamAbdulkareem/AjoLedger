import { useCallback, useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";

import { Button } from "../Button";
import { buildJoinUrl, buildShareMessage } from "../../lib/groupInviteLink";
import type { GroupInviteMember } from "../../lib/groupMembers";
import { useThemedStyles, type Theme } from "../../theme";

type GroupInviteContentProps = {
  groupName: string;
  inviteCode: string;
  members: GroupInviteMember[];
  joinedCount: number;
  numberOfParticipants: number;
  onDone: () => void;
};

export function GroupInviteContent({
  groupName,
  inviteCode,
  members,
  joinedCount,
  numberOfParticipants,
  onDone,
}: GroupInviteContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);

  const joinUrl = useMemo(() => buildJoinUrl(inviteCode), [inviteCode]);

  const handleCopy = useCallback(
    async (value: string, field: "code" | "link") => {
      await Clipboard.setStringAsync(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    },
    [],
  );

  const handleShare = useCallback(async () => {
    await Share.share({
      message: buildShareMessage(groupName, inviteCode),
    });
  }, [groupName, inviteCode]);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("groups.invite.codeLabel")}</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeValue} accessibilityLabel={inviteCode}>
            {inviteCode}
          </Text>
          <Pressable
            onPress={() => void handleCopy(inviteCode, "code")}
            accessibilityRole="button"
            accessibilityLabel={t("groups.invite.copyCode")}
            style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
          >
            <Ionicons name="copy-outline" size={20} color={styles.copyIcon.color} />
          </Pressable>
        </View>
        {copiedField === "code" ? (
          <Text style={styles.copiedHint}>{t("groups.invite.copied")}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("groups.invite.linkLabel")}</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkValue} numberOfLines={1}>
            {joinUrl}
          </Text>
          <Pressable
            onPress={() => void handleCopy(joinUrl, "link")}
            accessibilityRole="button"
            accessibilityLabel={t("groups.invite.copyLink")}
            style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
          >
            <Ionicons name="copy-outline" size={20} color={styles.copyIcon.color} />
          </Pressable>
        </View>
        {copiedField === "link" ? (
          <Text style={styles.copiedHint}>{t("groups.invite.copied")}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.joinedProgress}>
          {t("groups.invite.joinedProgress", {
            joined: joinedCount,
            total: numberOfParticipants,
          })}
        </Text>
        <Text style={styles.membersTitle}>
          {t("groups.invite.membersTitle", { count: members.length })}
        </Text>
        <View style={styles.membersList}>
          {members.length === 0 ? (
            <Text style={styles.emptyMembers}>{t("groups.invite.noMembersYet")}</Text>
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={[styles.statusBadge, styles.statusJoined]}>
                  <Text style={[styles.statusLabel, styles.statusLabelJoined]}>
                    {t("groups.invite.statusJoined")}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label={t("groups.invite.share")}
          onPress={() => void handleShare()}
          size="compact"
          iconRight="share-social-outline"
        />
        <Button
          label={t("groups.invite.done")}
          onPress={onDone}
          variant="secondary"
          size="compact"
        />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.sm,
    },
    sectionLabel: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    codeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
    },
    codeValue: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 20,
      lineHeight: 28,
      color: theme.colors.textPrimary,
      letterSpacing: 1,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      minHeight: 52,
    },
    linkValue: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    copyButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    copyIcon: {
      color: theme.colors.textPrimary,
    },
    copiedHint: {
      ...theme.typography.caption,
      color: theme.colors.successDark,
    },
    joinedProgress: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.textPrimary,
    },
    membersTitle: {
      fontFamily: theme.fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
    membersList: {
      gap: theme.spacing.sm,
    },
    emptyMembers: {
      ...theme.typography.caption,
      color: theme.colors.textMuted,
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    memberName: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    statusJoined: {
      backgroundColor: theme.colors.successMuted,
    },
    statusLabel: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 12,
      lineHeight: 16,
    },
    statusLabelJoined: {
      color: theme.colors.successDark,
    },
    actions: {
      gap: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
  });
