import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeTabKey } from "../../models/home";
import { handleAppTabPress } from "../../lib/navigateAppTab";
import { useThemedStyles, type Theme } from "../../theme";

type HomeTabBarProps = {
  activeTab?: HomeTabKey;
  onTabPress?: (tab: HomeTabKey) => void;
};

const TABS: {
  key: HomeTabKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}[] = [
  {
    key: "home",
    icon: "home-outline",
    activeIcon: "home",
    labelKey: "home.tabs.home",
  },
  {
    key: "groups",
    icon: "people-outline",
    activeIcon: "people",
    labelKey: "home.tabs.groups",
  },
  {
    key: "contributions",
    icon: "download-outline",
    activeIcon: "download",
    labelKey: "home.tabs.contributions",
  },
  {
    key: "payouts",
    icon: "wallet-outline",
    activeIcon: "wallet",
    labelKey: "home.tabs.payouts",
  },
  {
    key: "profile",
    icon: "person-outline",
    activeIcon: "person",
    labelKey: "home.tabs.profile",
  },
];

export function HomeTabBar({
  activeTab = "home",
  onTabPress,
}: HomeTabBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  const handlePress = (tab: HomeTabKey) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }
    handleAppTabPress(tab, router, t);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(tab.labelKey)}
            style={styles.tab}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? "#00732E" : "#6D7888"}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.inputBorder,
      backgroundColor: theme.colors.surface,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      gap: 4,
      paddingBottom: theme.spacing.xs,
    },
    label: {
      ...theme.typography.micro,
      color: theme.colors.textMuted,
    },
    labelActive: {
      color: theme.colors.success,
      fontFamily: theme.fontFamily.semibold,
    },
  });
