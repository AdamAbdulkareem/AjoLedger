import { useCallback, useEffect, useRef, useState } from "react";

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
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

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
      if (requestId !== requestIdRef.current) {
        return;
      }

      setItems(activity);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
      setItems([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
