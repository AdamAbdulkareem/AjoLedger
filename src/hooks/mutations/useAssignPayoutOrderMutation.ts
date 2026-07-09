import { useMutation } from "@tanstack/react-query";

import { assignPayoutOrder, startGroupCycle } from "../../api/groups";
import { ApiError } from "../../api/client";
import {
  invalidateGroupDetailsQueries,
  invalidateGroupsQueries,
} from "../../lib/invalidateQueries";
import type { AssignPayoutOrderPayload } from "../../models/group";

type StartPayoutOrderInput = {
  groupId: string;
  payload: AssignPayoutOrderPayload;
};

export function useAssignPayoutOrderMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: async ({ groupId, payload }: StartPayoutOrderInput) => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      await assignPayoutOrder(accessToken, groupId, payload);
      await startGroupCycle(accessToken, groupId);
    },
    onSuccess: async (_data, variables) => {
      if (!accessToken) return;

      await invalidateGroupsQueries(accessToken);
      await invalidateGroupDetailsQueries(accessToken, variables.groupId);
    },
  });
}
