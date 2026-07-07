import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AmountRemainsCard } from "./AmountRemainsCard";
import { HomeGroupCarousel } from "./HomeGroupCarousel";
import { HomeHeader } from "./HomeHeader";
import { HomeTotalDueCard } from "./HomeTotalDueCard";
import { RecentActivitySection } from "./RecentActivitySection";
import { SavingsOverviewCard } from "./SavingsOverviewCard";
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
  const [selectedIndex, setSelectedIndex] = useState(0);

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

      {data.recentActivity.length > 0 ? (
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
  });
