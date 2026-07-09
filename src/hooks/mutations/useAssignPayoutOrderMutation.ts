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

const CYCLE_START_ATTEMPTS = 3;

function isNonRetryableClientError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status != null &&
    error.status >= 400 &&
    error.status < 500
  );
}

async function startGroupCycleWithRetry(
  accessToken: string,
  groupId: string,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= CYCLE_START_ATTEMPTS; attempt += 1) {
    try {
      await startGroupCycle(accessToken, groupId);
      return;
    } catch (error) {
      lastError = error;
      if (isNonRetryableClientError(error)) {
        throw error;
      }
      if (attempt < CYCLE_START_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }

  throw lastError;
}

export function useAssignPayoutOrderMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: async ({ groupId, payload }: StartPayoutOrderInput) => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }

      // Backend has no combined assign+start endpoint or payout-order rollback.
      // Assign first, then retry cycle start; on cycle failure refresh cache so
      // the UI reflects the saved order instead of a stale pre-assign state.
      await assignPayoutOrder(accessToken, groupId, payload);

      try {
        await startGroupCycleWithRetry(accessToken, groupId);
      } catch (error) {
        // Order may already be persisted; refresh so UI is not stuck pre-assign.
        await Promise.all([
          invalidateGroupsQueries(accessToken),
          invalidateGroupDetailsQueries(accessToken, groupId),
        ]);
        throw error;
      }
    },
    onSuccess: async (_data, variables) => {
      if (!accessToken) return;

      await invalidateGroupsQueries(accessToken);
      await invalidateGroupDetailsQueries(accessToken, variables.groupId);
    },
  });
}
