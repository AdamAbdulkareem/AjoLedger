import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { formatNaira } from "../../lib/formatMoney";
import type { ContributionFrequency, GroupSummary } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type GroupListCardProps = {
  group: GroupSummary;
  onPress: () => void;
  loading?: boolean;
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

export function GroupListCard({ group, onPress, loading = false }: GroupListCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const contributionLine =
    group.contributionAmount != null
      ? t("groups.list.contributionLine", {
          amount: formatNaira(group.contributionAmount),
          frequency: t(frequencyLabelKey(group.frequency)),
        })
      : null;

  const joinedCount = group.joinedCount ?? 0;
  const totalParticipants = group.numberOfParticipants ?? 0;
  const showProgress = group.isCreator && totalParticipants > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={group.name}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        {group.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>
        ) : null}
        {contributionLine ? (
          <Text style={styles.contribution}>{contributionLine}</Text>
        ) : null}
        {showProgress ? (
          <Text style={styles.progress}>
            {t("groups.invite.joinedProgress", {
              joined: joinedCount,
              total: totalParticipants,
            })}
          </Text>
        ) : null}
        {group.isCreator ? (
          <Text style={styles.role}>{t("groups.list.creatorBadge")}</Text>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={styles.chevron.color}
        style={styles.chevronIcon}
      />
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.brand} />
      ) : null}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 16,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
    content: {
      flex: 1,
      gap: 4,
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
    contribution: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.textPrimary,
    },
    progress: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    role: {
      ...theme.typography.micro,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.brand,
      marginTop: 2,
    },
    chevronIcon: {
      marginTop: 2,
    },
    chevron: {
      color: theme.colors.textMuted,
    },
  });
