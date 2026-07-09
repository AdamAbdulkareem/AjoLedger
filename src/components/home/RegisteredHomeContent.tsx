import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AmountRemainsCard } from "./AmountRemainsCard";
import { HomeGroupCarousel } from "./HomeGroupCarousel";
import { HomeHeader } from "./HomeHeader";
import { HomeTotalDueCard } from "./HomeTotalDueCard";
import { RecentActivitySection } from "./RecentActivitySection";
import { SavingsOverviewCard } from "./SavingsOverviewCard";
import { getInitialCarouselIndex } from "../../lib/carouselMetrics";
import type { RecentActivityItem, RegisteredHomeData } from "../../models/home";
import { useThemedStyles, type Theme } from "../../theme";

type RegisteredHomeContentProps = {
  data: RegisteredHomeData;
  onGroupPress: (groupId: string) => void;
  onPayNowPress: (groupId: string) => void;
  onDetailsPress: (groupId: string) => void;
  onViewAllActivityPress: () => void;
  onActivityPress: (item: RecentActivityItem) => void;
};

export function RegisteredHomeContent({
  data,
  onGroupPress,
  onPayNowPress,
  onDetailsPress,
  onViewAllActivityPress,
  onActivityPress,
}: RegisteredHomeContentProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const isMultiGroup = data.groups.length > 1;
  const [selectedIndex, setSelectedIndex] = useState(() =>
    getInitialCarouselIndex(data.groups.length),
  );

  useEffect(() => {
    setSelectedIndex((current) => {
      const maxIndex = Math.max(data.groups.length - 1, 0);
      if (current > maxIndex) return getInitialCarouselIndex(data.groups.length);
      return current;
    });
  }, [data.groups.length]);

  const primaryDashboard = data.groups[selectedIndex] ?? data.groups[0];

  const showComingSoon = () => {
    Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
  };

  return (
    <View style={styles.container}>
      <HomeHeader displayName={data.displayName} avatarUrl={data.avatarUrl} />

      {isMultiGroup ? (
        <View style={styles.multiGroupBlock}>
          <HomeGroupCarousel
            groups={data.groups}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            onGroupPress={onGroupPress}
          />

          <HomeTotalDueCard
            totalDue={data.totalDueThisWeek}
            onSettleAllPress={showComingSoon}
          />
        </View>
      ) : primaryDashboard ? (
        <>
          <SavingsOverviewCard
            group={primaryDashboard.group}
            progress={primaryDashboard.progress}
            payout={primaryDashboard.payout}
            isCreator={primaryDashboard.isCreator}
            onGroupPress={() => onGroupPress(primaryDashboard.groupId)}
            onDetailsPress={() => onDetailsPress(primaryDashboard.groupId)}
          />

          {primaryDashboard.amountRemains.amount > 0 ? (
            <AmountRemainsCard
              amountRemains={primaryDashboard.amountRemains}
              onPayNowPress={() => onPayNowPress(primaryDashboard.groupId)}
            />
          ) : null}
        </>
      ) : null}

      {data.recentActivityError ? (
        <Text style={styles.activityError}>{data.recentActivityError}</Text>
      ) : data.recentActivity.length > 0 ? (
        <RecentActivitySection
          items={data.recentActivity}
          showGroupTags={isMultiGroup}
          viewAllLabel={t("home.viewAll")}
          onViewAllPress={onViewAllActivityPress}
          onItemPress={onActivityPress}
        />
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    multiGroupBlock: {
      gap: 14,
    },
    activityError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      textAlign: "center",
    },
  });
