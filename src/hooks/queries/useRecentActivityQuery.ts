import { useQuery } from "@tanstack/react-query";

import { getRecentActivity } from "../../api/activity";
import { ApiError } from "../../api/client";
import { queryKeys } from "../../lib/queryKeys";

export function useRecentActivityQuery(
  accessToken: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.recentActivity(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }
      return getRecentActivity(accessToken);
    },
    enabled: enabled && !!accessToken,
  });
}
