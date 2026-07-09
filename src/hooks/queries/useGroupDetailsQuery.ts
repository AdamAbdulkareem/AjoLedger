import { useQuery } from "@tanstack/react-query";

import { getGroupDetails } from "../../api/groups";
import { ApiError } from "../../api/client";
import type { CurrentUserIdentity } from "../../lib/groupApiNormalize";
import { queryKeys } from "../../lib/queryKeys";

type UseGroupDetailsQueryOptions = {
  expectedParticipants?: number;
  currentUser?: CurrentUserIdentity | null;
  enabled?: boolean;
};

export function useGroupDetailsQuery(
  accessToken: string | null,
  groupId: string,
  options?: UseGroupDetailsQueryOptions,
) {
  const enabled = (options?.enabled ?? true) && !!accessToken && !!groupId;
  const currentUserId = options?.currentUser?.id ?? null;
  const currentUserEmail = options?.currentUser?.email ?? null;

  return useQuery({
    queryKey: queryKeys.groupDetails(
      accessToken,
      groupId,
      options?.expectedParticipants,
      currentUserId,
      currentUserEmail,
    ),
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return getGroupDetails(accessToken, groupId, {
        expectedParticipants: options?.expectedParticipants,
        currentUser: options?.currentUser ?? {
          id: currentUserId ?? undefined,
          email: currentUserEmail ?? undefined,
        },
      });
    },
    enabled,
  });
}
