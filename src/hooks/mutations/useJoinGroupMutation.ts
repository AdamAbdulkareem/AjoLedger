import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { joinGroup } from "../../api/groups";
import { ApiError } from "../../api/client";
import {
  invalidateGroupDetailsQueries,
  invalidateGroupsQueries,
} from "../../lib/invalidateQueries";
import { queryKeys } from "../../lib/queryKeys";
import type { GroupSummary, JoinGroupPayload } from "../../models/group";

function groupsInfiniteKey(accessToken: string) {
  return [...queryKeys.groups(accessToken), "infinite"] as const;
}

export function useJoinGroupMutation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JoinGroupPayload) => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return joinGroup(accessToken, payload);
    },
    onMutate: async () => {
      if (!accessToken) return { previous: undefined };

      const queryKey = groupsInfiniteKey(accessToken);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<InfiniteData<GroupSummary[]>>(
        queryKey,
      );

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (!accessToken || context?.previous === undefined) return;

      queryClient.setQueryData(
        groupsInfiniteKey(accessToken),
        context.previous,
      );
    },
    onSuccess: async (result) => {
      if (!accessToken) return;

      await Promise.all([
        invalidateGroupsQueries(accessToken),
        invalidateGroupDetailsQueries(accessToken, result.groupId),
      ]);
    },
  });
}
