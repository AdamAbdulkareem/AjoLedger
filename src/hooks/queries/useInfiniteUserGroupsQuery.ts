import { useInfiniteQuery } from "@tanstack/react-query";

import { getUserGroups, GROUPS_PAGE_SIZE } from "../../api/groups";
import { ApiError } from "../../api/client";
import { getRememberedCreatorGroupIds } from "../../lib/creatorGroupsStorage";
import { queryKeys } from "../../lib/queryKeys";
import type { GroupSummary } from "../../models/group";

/**
 * Badge-only: merge per-user remembered creator IDs into list cards.
 * Never used for Invite/Payout authorization.
 */
function applyRememberedCreatorFlags(
  groups: GroupSummary[],
  creatorGroupIds: Set<string>,
): GroupSummary[] {
  if (creatorGroupIds.size === 0) {
    return groups;
  }

  return groups.map((group) => {
    if (group.isCreator === true) {
      return group;
    }

    if (!creatorGroupIds.has(group.id)) {
      return group;
    }

    return {
      ...group,
      isCreator: true,
    };
  });
}

async function fetchGroupsPage(
  accessToken: string,
  page: number,
  userId?: string | null,
): Promise<GroupSummary[]> {
  const list = await getUserGroups(accessToken, {
    page,
    limit: GROUPS_PAGE_SIZE,
  });

  if (!userId) {
    return list;
  }

  const creatorGroupIds = await getRememberedCreatorGroupIds(userId);
  return applyRememberedCreatorFlags(list, creatorGroupIds);
}

export function useInfiniteUserGroupsQuery(
  accessToken: string | null,
  enabled: boolean,
  userId?: string | null,
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.groups(accessToken), "infinite", userId ?? null],
    queryFn: ({ pageParam }) => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return fetchGroupsPage(accessToken, pageParam, userId);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < GROUPS_PAGE_SIZE ? undefined : lastPageParam + 1,
    enabled: enabled && !!accessToken,
  });
}
