import { useQuery } from "@tanstack/react-query";

import { getGroupDetails } from "../../api/groups";
import { ApiError } from "../../api/client";
import { queryKeys } from "../../lib/queryKeys";

type UseGroupDetailsQueryOptions = {
  expectedParticipants?: number;
  enabled?: boolean;
};

export function useGroupDetailsQuery(
  accessToken: string | null,
  groupId: string,
  options?: UseGroupDetailsQueryOptions,
) {
  const enabled = (options?.enabled ?? true) && !!accessToken && !!groupId;

  return useQuery({
    queryKey: queryKeys.groupDetails(
      accessToken,
      groupId,
      options?.expectedParticipants,
    ),
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return getGroupDetails(accessToken, groupId, {
        expectedParticipants: options?.expectedParticipants,
      });
    },
    enabled,
  });
}
