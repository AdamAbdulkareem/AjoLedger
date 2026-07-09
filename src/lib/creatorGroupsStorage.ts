import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isGroupAdminForCurrentUser,
  type CurrentUserIdentity,
} from "./groupApiNormalize";
import type { GroupDetails } from "../models/group";

/** Legacy device-global key — cleared on read/logout so it cannot leak across users. */
const LEGACY_CREATOR_GROUP_IDS_KEY = "ajoledger.creatorGroupIds";

function creatorGroupIdsKey(userId: string): string {
  return `ajoledger.creatorGroupIds.${userId}`;
}

async function readCreatorGroupIds(userId: string): Promise<Set<string>> {
  if (!userId.trim()) {
    return new Set();
  }

  try {
    const raw = await AsyncStorage.getItem(creatorGroupIdsKey(userId));
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

async function writeCreatorGroupIds(
  userId: string,
  ids: Set<string>,
): Promise<void> {
  await AsyncStorage.setItem(
    creatorGroupIdsKey(userId),
    JSON.stringify([...ids]),
  );
}

/** Best-effort UI hint only — never used for Invite/Payout authorization. */
export async function rememberCreatorGroup(
  userId: string,
  groupId: string,
): Promise<void> {
  if (!userId.trim() || !groupId.trim()) {
    return;
  }

  const ids = await readCreatorGroupIds(userId);
  ids.add(groupId);
  await writeCreatorGroupIds(userId, ids);
}

/** Display-only. Do not use for access control. */
export async function getRememberedCreatorGroupIds(
  userId: string,
): Promise<Set<string>> {
  return readCreatorGroupIds(userId);
}

/** Drop a group from this user's creator badge hints (e.g. after join as CONTRIBUTOR). */
export async function forgetCreatorGroup(
  userId: string,
  groupId: string,
): Promise<void> {
  if (!userId.trim() || !groupId.trim()) {
    return;
  }

  const ids = await readCreatorGroupIds(userId);
  if (!ids.delete(groupId)) {
    return;
  }
  await writeCreatorGroupIds(userId, ids);
}

/** Align per-user creator badge hints with membership role from group details. */
export async function syncCreatorBadge(
  userId: string,
  groupId: string,
  details: GroupDetails,
  currentUser?: CurrentUserIdentity | null,
): Promise<void> {
  if (!userId.trim() || !groupId.trim()) {
    return;
  }

  const isAdmin = isGroupAdminForCurrentUser(details, currentUser);
  try {
    if (isAdmin) {
      await rememberCreatorGroup(userId, groupId);
    } else {
      await forgetCreatorGroup(userId, groupId);
    }
  } catch {
    // Best-effort UI hint — never block callers.
  }
}

/** Clears per-user + legacy device-global creator hints (call on logout). */
export async function clearRememberedCreatorGroups(
  userId?: string | null,
): Promise<void> {
  const tasks: Promise<void>[] = [
    AsyncStorage.removeItem(LEGACY_CREATOR_GROUP_IDS_KEY),
  ];

  if (userId?.trim()) {
    tasks.push(AsyncStorage.removeItem(creatorGroupIdsKey(userId)));
  }

  await Promise.all(tasks);
}
