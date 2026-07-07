import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ReturningGroupListCard } from "./ReturningGroupListCard";
import { GroupsActionCard } from "./GroupsActionCard";
import type { GroupSummary } from "../../models/group";
import { useThemedStyles, type Theme } from "../../theme";

type ReturningUserGroupsContentProps = {
  groups: GroupSummary[];
  joinedSuccessMessage?: string;
  openingGroupId?: string | null;
  onCreateGroupPress: () => void;
  onGroupPress: (group: GroupSummary) => void;
};

export function ReturningUserGroupsContent({
  groups,
  joinedSuccessMessage,
  openingGroupId = null,
  onCreateGroupPress,
  onGroupPress,
}: ReturningUserGroupsContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {joinedSuccessMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{joinedSuccessMessage}</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {groups.map((group, index) => (
          <ReturningGroupListCard
            key={group.id}
            group={group}
            index={index}
            loading={openingGroupId === group.id}
            onPress={() => onGroupPress(group)}
          />
        ))}
      </View>

      <View style={styles.paddedSection}>
        <GroupsActionCard
          variant="create"
          title={t("groups.list.createNew")}
          subtitle={t("groups.list.createNewSubtitle")}
          onPress={onCreateGroupPress}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 20,
      paddingBottom: theme.spacing.lg,
    },
    paddedSection: {
      paddingHorizontal: theme.spacing.md,
    },
    successBanner: {
      marginHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.successMuted,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    successText: {
      ...theme.typography.caption,
      fontFamily: theme.fontFamily.semibold,
      color: theme.colors.successDark,
      textAlign: "center",
    },
    list: {
      paddingHorizontal: theme.spacing.md,
      gap: 20,
    },
  });
