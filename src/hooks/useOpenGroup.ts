import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { getGroupDetails } from "../api/groups";
import { useAuth } from "../context/AuthProvider";
import { useCurrentUser } from "../context/CurrentUserProvider";
import {
  openGroupDetail,
  openGroupInvite,
  openGroupLedger,
} from "../lib/appNavigation";
import { hasActiveGroupCycle } from "../lib/groupCycle";
import { isGroupAdminForCurrentUser } from "../lib/groupApiNormalize";
import {
  invalidateGroupDetailsQueries,
  invalidateGroupsQueries,
} from "../lib/invalidateQueries";
import type { GroupSummary } from "../models/group";

export function useOpenGroup() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken, user } = useAuth();
  const { currentUser } = useCurrentUser();
  const [openingGroupId, setOpeningGroupId] = useState<string | null>(null);

  const openGroup = useCallback(
    async (group: GroupSummary) => {
      if (openingGroupId) {
        return;
      }

      if (!accessToken) {
        Alert.alert(t("home.errors.generic"));
        return;
      }

      const currentUserIdentity = {
        id: user?.id ?? currentUser?.id,
        email: user?.email ?? currentUser?.email,
      };

      if (!currentUserIdentity.email) {
        Alert.alert(t("home.errors.generic"));
        return;
      }

      setOpeningGroupId(group.id);

      try {
        if (hasActiveGroupCycle(group)) {
          openGroupLedger(router, group.id);
          void invalidateGroupsQueries(accessToken);
          void invalidateGroupDetailsQueries(accessToken, group.id);
          return;
        }

        const details = await getGroupDetails(accessToken, group.id, {
          currentUser: currentUserIdentity,
        });

        void invalidateGroupsQueries(accessToken);

        if (hasActiveGroupCycle(details)) {
          openGroupLedger(router, group.id);
          void invalidateGroupDetailsQueries(accessToken, group.id);
          return;
        }

        if (isGroupAdminForCurrentUser(details, currentUserIdentity)) {
          openGroupInvite(router, group.id, group.numberOfParticipants);
          return;
        }

        openGroupDetail(router, group.id);
      } catch (error) {
        console.error("Failed to open group:", error);
        Alert.alert(t("home.errors.generic"));
      } finally {
        setOpeningGroupId(null);
      }
    },
    [
      accessToken,
      currentUser?.email,
      currentUser?.id,
      openingGroupId,
      router,
      t,
      user?.email,
      user?.id,
    ],
  );

  const openGroupById = useCallback(
    async (groupId: string, groups: GroupSummary[]) => {
      const summary = groups.find((group) => group.id === groupId);
      if (summary) {
        await openGroup(summary);
        return;
      }

      await openGroup({ id: groupId, name: "" });
    },
    [openGroup],
  );

  /** Opens group detail for pay-in (virtual account), even if the user is the creator. */
  const openGroupForPayment = useCallback(
    (groupId: string) => {
      if (!groupId.trim()) {
        Alert.alert(t("home.errors.generic"));
        return;
      }

      openGroupDetail(router, groupId);
    },
    [router, t],
  );

  return { openGroup, openGroupById, openGroupForPayment, openingGroupId };
}
