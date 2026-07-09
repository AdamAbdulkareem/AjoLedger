import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { isUserGroupCreator } from "../api/groups";
import { useAuth } from "../context/AuthProvider";
import { openGroupDetail, openGroupInvite } from "../lib/appNavigation";
import { isGroupCreator } from "../lib/groupApiNormalize";
import type { GroupSummary } from "../models/group";

export function useOpenGroup() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [openingGroupId, setOpeningGroupId] = useState<string | null>(null);

  const openGroup = useCallback(
    async (group: GroupSummary) => {
      if (openingGroupId) {
        return;
      }

      if (isGroupCreator(group)) {
        openGroupInvite(router, group.id, group.numberOfParticipants);
        return;
      }

      if (!accessToken) {
        Alert.alert(t("home.errors.generic"));
        return;
      }

      setOpeningGroupId(group.id);

      try {
        const creator = await isUserGroupCreator(accessToken, group.id, group);
        if (creator) {
          openGroupInvite(router, group.id, group.numberOfParticipants);
          return;
        }

        openGroupDetail(router, group.id);
      } catch (error) {
        console.error("Failed to check group creator status:", error);
        Alert.alert(t("home.errors.generic"));
      } finally {
        setOpeningGroupId(null);
      }
    },
    [accessToken, openingGroupId, router, t],
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
