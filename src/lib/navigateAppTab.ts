import { Alert } from "react-native";
import type { Href } from "expo-router";
import type { TFunction } from "i18next";

import type { HomeTabKey } from "../models/home";

const TAB_ROUTES: Partial<Record<HomeTabKey, Href>> = {
  home: "/(app)/home",
  profile: "/(app)/profile",
};

export function handleAppTabPress(
  tab: HomeTabKey,
  router: { push: (href: Href) => void },
  t: TFunction,
): void {
  const route = TAB_ROUTES[tab];
  if (route) {
    router.push(route);
    return;
  }

  Alert.alert(t("home.comingSoonTitle"), t("home.comingSoonBody"));
}
