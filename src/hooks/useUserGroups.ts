import { useCallback, useMemo } from "react";

import { ApiError } from "../api/client";
import { useInfiniteUserGroupsQuery } from "./queries/useInfiniteUserGroupsQuery";
import type { GroupSummary } from "../models/group";

type UseUserGroupsResult = {
  groups: GroupSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

function resolveQueryError(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export function useUserGroups(
  token: string | null,
  enabled = true,
): UseUserGroupsResult {
  const query = useInfiniteUserGroupsQuery(token, enabled);

  const groups = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data],
  );

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const fetchNextPage = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) {
      return;
    }

    await query.fetchNextPage();
  }, [query]);

  if (!token) {
    return {
      groups: [],
      loading: false,
      error: "You are not signed in.",
      refresh,
      fetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    };
  }

  return {
    groups,
    loading: query.isLoading,
    error: resolveQueryError(query.error),
    refresh,
    fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
