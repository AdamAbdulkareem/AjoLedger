import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { createGroup } from "../../api/groups";
import { ApiError } from "../../api/client";
import {
  invalidateGroupDetailsQueries,
  invalidateGroupsQueries,
} from "../../lib/invalidateQueries";
import { queryKeys } from "../../lib/queryKeys";
import type {
  CreateGroupPayload,
  CreatedGroup,
  GroupSummary,
} from "../../models/group";

function buildOptimisticGroup(payload: CreateGroupPayload): GroupSummary {
  return {
    id: `optimistic-${Date.now()}`,
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    frequency: payload.frequency,
    contributionAmount: payload.contributionAmount,
    numberOfParticipants: payload.numberOfParticipants,
    joinedCount: 1,
    isCreator: true,
  };
}

function groupsInfiniteKey(accessToken: string) {
  return [...queryKeys.groups(accessToken), "infinite"] as const;
}

export function useCreateGroupMutation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGroupPayload): Promise<CreatedGroup> => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      return createGroup(accessToken, payload);
    },
    onMutate: async (payload) => {
      if (!accessToken) return { previous: undefined };

      const queryKey = groupsInfiniteKey(accessToken);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<InfiniteData<GroupSummary[]>>(
        queryKey,
      );

      queryClient.setQueryData<InfiniteData<GroupSummary[]>>(
        queryKey,
        (current) => {
          const optimistic = buildOptimisticGroup(payload);

          if (!current) {
            return { pages: [[optimistic]], pageParams: [1] };
          }

          const pages = [...current.pages];
          const lastIndex = Math.max(pages.length - 1, 0);
          pages[lastIndex] = [...(pages[lastIndex] ?? []), optimistic];

          return {
            ...current,
            pages,
          };
        },
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
    onSuccess: async (created) => {
      if (!accessToken) return;

      await invalidateGroupsQueries(accessToken);
      await invalidateGroupDetailsQueries(accessToken, created.id);
    },
  });
}
