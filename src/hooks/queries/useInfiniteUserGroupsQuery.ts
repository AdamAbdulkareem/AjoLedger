import { useInfiniteQuery } from "@tanstack/react-query";

import { getUserGroups, GROUPS_PAGE_SIZE } from "../../api/groups";
import { ApiError } from "../../api/client";
import { getRememberedCreatorGroupIds } from "../../lib/creatorGroupsStorage";
import { queryKeys } from "../../lib/queryKeys";
import type { GroupSummary } from "../../models/group";

function applyRememberedCreatorFlags(
  groups: GroupSummary[],
  creatorGroupIds: Set<string>,
): GroupSummary[] {
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
): Promise<GroupSummary[]> {
  const [list, creatorGroupIds] = await Promise.all([
    getUserGroups(accessToken, { page, limit: GROUPS_PAGE_SIZE }),
    getRememberedCreatorGroupIds(),
  ]);

  return applyRememberedCreatorFlags(list, creatorGroupIds);
}

export function useInfiniteUserGroupsQuery(
  accessToken: string | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.groups(accessToken), "infinite"],
    queryFn: ({ pageParam }) => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return fetchGroupsPage(accessToken, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < GROUPS_PAGE_SIZE ? undefined : lastPageParam + 1,
    enabled: enabled && !!accessToken,
  });
}
