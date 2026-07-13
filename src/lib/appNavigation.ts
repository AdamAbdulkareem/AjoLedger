import type { Href } from "expo-router";

type AppRouter = {
  push: (href: Href) => void;
  replace: (href: Href) => void;
};

export function openGroupDetail(
  router: Pick<AppRouter, "push" | "replace">,
  groupId: string,
  options?: { replace?: boolean },
) {
  const href = {
    pathname: "/(app)/groups/[groupId]" as const,
    params: { groupId },
  };

  if (options?.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}

export function openGroupInvite(
  router: Pick<AppRouter, "push">,
  groupId: string,
  expectedParticipants?: number,
) {
  router.push({
    pathname: "/(app)/groups/invite",
    params: {
      groupId,
      ...(expectedParticipants != null
        ? { expectedParticipants: String(expectedParticipants) }
        : {}),
    },
  });
}

export function openPayoutOrder(
  router: Pick<AppRouter, "push">,
  groupId: string,
  expectedParticipants?: number,
) {
  router.push({
    pathname: "/(app)/groups/payout-order",
    params: {
      groupId,
      ...(expectedParticipants != null
        ? { expectedParticipants: String(expectedParticipants) }
        : {}),
    },
  });
}

export function openGroupLedger(
  router: Pick<AppRouter, "push" | "replace">,
  groupId: string,
  options?: { replace?: boolean },
) {
  const href = {
    pathname: "/(app)/groups/ledger" as const,
    params: { groupId },
  };

  if (options?.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}

export function openGroupPayout(
  router: Pick<AppRouter, "push">,
  groupId: string,
) {
  router.push({
    pathname: "/(app)/groups/payout" as const,
    params: { groupId },
  });
}

export function openGroupsTab(router: Pick<AppRouter, "replace">) {
  router.replace("/(app)/groups");
}
