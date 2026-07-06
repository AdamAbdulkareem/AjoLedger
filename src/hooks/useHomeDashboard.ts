import { useCallback, useEffect, useState } from "react";

import { getHomeDashboard } from "../api/home";
import { ApiError } from "../api/client";
import type { HomeDashboard } from "../models/home";

type UseHomeDashboardOptions = {
  enabled?: boolean;
};

type UseHomeDashboardResult = {
  data: HomeDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useHomeDashboard(
  token: string | null,
  displayName?: string,
  { enabled = true }: UseHomeDashboardOptions = {},
): UseHomeDashboardResult {
  const [data, setData] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!token) {
      setData(null);
      setLoading(false);
      setError("You are not signed in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboard = await getHomeDashboard(token, displayName);
      setData(dashboard);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, displayName, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
