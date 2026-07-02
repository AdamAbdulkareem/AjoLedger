import { useCallback, useEffect, useState } from "react";

import { getHomeDashboard } from "../api/home";
import { ApiError } from "../api/client";
import type { HomeDashboard } from "../models/home";

type UseHomeDashboardResult = {
  data: HomeDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useHomeDashboard(
  token: string | null,
  displayName?: string,
): UseHomeDashboardResult {
  const [data, setData] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
  }, [token, displayName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
