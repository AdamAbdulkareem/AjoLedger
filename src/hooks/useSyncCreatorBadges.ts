import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";

import { getGroupDetails } from "../api/groups";
import { useAuth } from "../context/AuthProvider";
import { invalidateGroupsQueries } from "../lib/invalidateQueries";
import type { GroupSummary } from "../models/group";

/** Cap detail fetches so home focus stays snappy for large lists. */
const MAX_GROUPS_TO_SYNC = 12;

/**
 * Aligns Creator/Member badges on Home (and any shared groups cache) with
 * GET /groups/:id membership roles. Display-only — does not gate Invite.
 */
export function useSyncCreatorBadges(
  accessToken: string | null,
  groups: GroupSummary[],
  enabled: boolean,
) {
  const { user } = useAuth();
  const syncedKeyRef = useRef<string>("");

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !accessToken || !user?.id || !user?.email) {
        return;
      }

      if (groups.length === 0) {
        syncedKeyRef.current = "";
        return;
      }

      const groupIds = groups
        .slice(0, MAX_GROUPS_TO_SYNC)
        .map((group) => group.id)
        .filter(Boolean)
        .sort();
      const syncKey = `${user.id}:${groupIds.join(",")}`;

      if (syncedKeyRef.current === syncKey) {
        return;
      }

      let cancelled = false;
      const identity = { id: user.id, email: user.email };

      void (async () => {
        await Promise.all(
          groupIds.map((groupId) =>
            getGroupDetails(accessToken, groupId, {
              currentUser: identity,
            }).catch(() => null),
          ),
        );

        if (cancelled) {
          return;
        }

        syncedKeyRef.current = syncKey;
        await invalidateGroupsQueries(accessToken);
      })();

      return () => {
        cancelled = true;
      };
    }, [accessToken, enabled, groups, user?.email, user?.id]),
  );
}
