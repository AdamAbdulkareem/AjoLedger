import { useCallback, useEffect, useState } from "react";

import { getRecentActivity } from "../api/activity";
import { ApiError } from "../api/client";
import type { RecentActivityItem } from "../models/home";

type UseRecentActivityResult = {
  items: RecentActivityItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useRecentActivity(
  accessToken: string | null,
  enabled: boolean,
): UseRecentActivityResult {
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken || !enabled) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activity = await getRecentActivity(accessToken);
      setItems(activity);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
