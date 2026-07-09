import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../../api/banks";
import { ApiError } from "../../api/client";
import { queryKeys } from "../../lib/queryKeys";

export function useCurrentUserQuery(
  accessToken: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.currentUser(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }
      return getCurrentUser(accessToken);
    },
    enabled: enabled && !!accessToken,
  });
}
