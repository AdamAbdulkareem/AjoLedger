import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import { openGroupLedger } from "../lib/appNavigation";
import { hasActiveGroupCycle } from "../lib/groupCycle";
import type { GroupDetails } from "../models/group";

type UseRedirectWhenCycleActiveOptions = {
  groupId: string;
  details: GroupDetails | undefined;
  isLoading: boolean;
};

/**
 * Retires Invite / Payout Order once a cycle is live — redirects to ledger.
 */
export function useRedirectWhenCycleActive({
  groupId,
  details,
  isLoading,
}: UseRedirectWhenCycleActiveOptions): void {
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    redirectedRef.current = false;
  }, [groupId]);

  useEffect(() => {
    if (isLoading || !details || !groupId || redirectedRef.current) {
      return;
    }

    if (!hasActiveGroupCycle(details)) {
      return;
    }

    redirectedRef.current = true;
    openGroupLedger(router, groupId, { replace: true });
  }, [details, groupId, isLoading, router]);
}
