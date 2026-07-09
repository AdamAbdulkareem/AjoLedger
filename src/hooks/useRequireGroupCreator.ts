import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import { openGroupDetail } from "../lib/appNavigation";
import {
  isGroupAdminForCurrentUser,
  type CurrentUserIdentity,
} from "../lib/groupApiNormalize";
import type { GroupDetails } from "../models/group";

type UseRequireGroupCreatorOptions = {
  groupId: string;
  details: GroupDetails | undefined;
  isLoading: boolean;
  currentUser: CurrentUserIdentity | null | undefined;
  /** When true, redirect non-creators to group detail (default). */
  redirectToDetail?: boolean;
  onDenied?: () => void;
};

/**
 * Shared gate for Invite / Payout Order.
 * Recomputes admin from members[].email + role — never trusts details.isCreator alone.
 */
export function useRequireGroupCreator({
  groupId,
  details,
  isLoading,
  currentUser,
  redirectToDetail = true,
  onDenied,
}: UseRequireGroupCreatorOptions): {
  canAccess: boolean;
  isChecking: boolean;
} {
  const router = useRouter();
  const deniedRef = useRef(false);

  const identityReady = Boolean(currentUser?.email || currentUser?.id);
  const isChecking = isLoading || !details || !identityReady;
  const canAccess =
    !isChecking && isGroupAdminForCurrentUser(details, currentUser);

  useEffect(() => {
    deniedRef.current = false;
  }, [groupId]);

  useEffect(() => {
    if (isChecking || canAccess || deniedRef.current || !groupId) {
      return;
    }

    deniedRef.current = true;
    onDenied?.();

    if (redirectToDetail) {
      openGroupDetail(router, groupId, { replace: true });
    }
  }, [canAccess, groupId, isChecking, onDenied, redirectToDetail, router]);

  return { canAccess, isChecking };
}
