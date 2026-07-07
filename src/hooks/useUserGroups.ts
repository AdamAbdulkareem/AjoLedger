import { useCallback, useEffect, useState } from "react";

import { getUserGroups } from "../api/groups";
import { ApiError } from "../api/client";
import { getRememberedCreatorGroupIds } from "../lib/creatorGroupsStorage";
import type { GroupSummary } from "../models/group";

type UseUserGroupsResult = {
  groups: GroupSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function applyRememberedCreatorFlags(
  groups: GroupSummary[],
  creatorGroupIds: Set<string>,
): GroupSummary[] {
  return groups.map((group) => ({
    ...group,
    isCreator: group.isCreator || creatorGroupIds.has(group.id),
  }));
}

export function useUserGroups(token: string | null): UseUserGroupsResult {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setGroups([]);
      setLoading(false);
      setError("You are not signed in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [list, creatorGroupIds] = await Promise.all([
        getUserGroups(token),
        getRememberedCreatorGroupIds(),
      ]);
      setGroups(applyRememberedCreatorFlags(list, creatorGroupIds));
    } catch (err) {
      setGroups([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { groups, loading, error, refresh };
}
