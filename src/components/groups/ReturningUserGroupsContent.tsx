import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { ReturningGroupListCard } from "./ReturningGroupListCard";
import { GroupsActionCard } from "./GroupsActionCard";
import type { GroupSummary } from "../../models/group";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type ReturningUserGroupsContentProps = {
  groups: GroupSummary[];
  joinedSuccessMessage?: string;
  openingGroupId?: string | null;
  onCreateGroupPress: () => void;
  onGroupPress: (group: GroupSummary) => void;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

export function ReturningUserGroupsContent({
  groups,
  joinedSuccessMessage,
  openingGroupId = null,
  onCreateGroupPress,
  onGroupPress,
  onEndReached,
  hasNextPage = false,
  isFetchingNextPage = false,
}: ReturningUserGroupsContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderItem = useCallback(
    ({ item, index }: { item: GroupSummary; index: number }) => (
      <View style={styles.listItem}>
        <ReturningGroupListCard
          group={item}
          index={index}
          loading={openingGroupId === item.id}
          onPress={() => onGroupPress(item)}
        />
      </View>
    ),
    [onGroupPress, openingGroupId, styles.listItem],
  );

  const keyExtractor = useCallback((item: GroupSummary) => item.id, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator],
  );

  const ListHeaderComponent = joinedSuccessMessage ? (
    <View style={styles.successBanner}>
      <Text style={styles.successText}>{joinedSuccessMessage}</Text>
    </View>
  ) : null;

  const ListFooterComponent = (
    <View style={styles.paddedSection}>
      {isFetchingNextPage ? (
        <ActivityIndicator
          color={theme.colors.brand}
          style={styles.footerLoader}
        />
      ) : null}
      <GroupsActionCard
        variant="create"
        title={t("groups.list.createNew")}
        subtitle={t("groups.list.createNewSubtitle")}
        onPress={onCreateGroupPress}
      />
    </View>
  );

  return (
    <FlatList
      data={groups}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={0.4}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: theme.spacing.lg,
    },
    listItem: {
      paddingHorizontal: theme.spacing.md,
    },
    separator: {
      height: 20,
    },
    paddedSection: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    footerLoader: {
      marginBottom: theme.spacing.sm,
    },
    successBanner: {
      marginHorizontal: theme.spacing.md,
      marginBottom: 20,
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
  });
