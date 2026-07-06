import { useCallback, useEffect, useState } from "react";

import { getUserGroups } from "../api/groups";
import { ApiError } from "../api/client";
import type { GroupSummary } from "../models/group";

type UseUserGroupsResult = {
  groups: GroupSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

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
      const list = await getUserGroups(token);
      setGroups(list);
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
