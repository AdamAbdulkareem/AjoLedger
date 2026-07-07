import type { Href } from "expo-router";
import type { TFunction } from "i18next";

import type { HomeTabKey } from "../models/home";

const TAB_ROUTES: Record<HomeTabKey, Href> = {
  home: "/(app)/home",
  groups: "/(app)/groups",
  profile: "/(app)/profile",
};

export function handleAppTabPress(
  tab: HomeTabKey,
  router: { replace: (href: Href) => void },
  _t: TFunction,
): void {
  router.replace(TAB_ROUTES[tab]);
}
