import type { Href } from "expo-router";

type AppRouter = {
  push: (href: Href) => void;
  replace: (href: Href) => void;
};

export function openGroupDetail(router: Pick<AppRouter, "push">, groupId: string) {
  router.push({
    pathname: "/(app)/groups/[groupId]",
    params: { groupId },
  });
}

export function openGroupsTab(router: Pick<AppRouter, "replace">) {
  router.replace("/(app)/groups");
}
