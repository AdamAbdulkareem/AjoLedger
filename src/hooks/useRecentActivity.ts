import { useCallback } from "react";

import { ApiError } from "../api/client";
import { useRecentActivityQuery } from "./queries/useRecentActivityQuery";
import type { RecentActivityItem } from "../models/home";

type UseRecentActivityResult = {
  items: RecentActivityItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function resolveQueryError(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  return "Something went wrong.";
}

export function useRecentActivity(
  accessToken: string | null,
  enabled: boolean,
): UseRecentActivityResult {
  const query = useRecentActivityQuery(accessToken, enabled);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    items: query.data ?? [],
    loading: query.isFetching && !query.data,
    error: resolveQueryError(query.error),
    refresh,
  };
}
