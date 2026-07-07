import type {
  CreateGroupPayload,
  CreatedGroup,
  GroupDetails,
  GroupSummary,
  JoinGroupPayload,
  JoinGroupResult,
} from "../models/group";
import {
  normalizeGroupDetailsFromApi,
  normalizeGroupSummaryFromApi,
} from "../lib/groupApiNormalize";
import { getAllGroupMetadata, getStoredGroupMetadata } from "../lib/groupMetadataStorage";
import { getJoinedMembers } from "../lib/groupMembers";
import { apiRequest } from "./client";

function resolveParticipantCount(
  apiCount: number,
  joinedCount: number,
  storedCount?: number,
): number {
  const candidates = [apiCount, storedCount ?? 0].filter((value) => value > 0);
  if (candidates.length === 0) {
    return Math.max(joinedCount, 1);
  }

  return Math.max(...candidates, joinedCount);
}

function finalizeGroupDetails(
  raw: GroupDetails,
  storedParticipantCount?: number,
): GroupDetails {
  const joinedMembers = getJoinedMembers(raw.members);
  const joinedCount = raw.joinedCount || joinedMembers.length;

  return {
    ...raw,
    members: joinedMembers,
    joinedCount,
    numberOfParticipants: resolveParticipantCount(
      raw.numberOfParticipants,
      joinedCount,
      storedParticipantCount,
    ),
  };
}

export async function getUserGroups(token: string): Promise<GroupSummary[]> {
  const envelope = await apiRequest<unknown[]>("/groups", { token });
  const groups = (envelope.data ?? []).map(normalizeGroupSummaryFromApi);
  const metadataMap = await getAllGroupMetadata();

  return groups.map((group) => {
    const stored = metadataMap[group.id];
    if (!stored?.numberOfParticipants) {
      return group;
    }

    return {
      ...group,
      numberOfParticipants: resolveParticipantCount(
        group.numberOfParticipants ?? 0,
        group.joinedCount ?? 0,
        stored.numberOfParticipants,
      ),
    };
  });
}

export async function createGroup(
  token: string,
  payload: CreateGroupPayload,
): Promise<CreatedGroup> {
  const envelope = await apiRequest<CreatedGroup>("/groups", {
    method: "POST",
    body: payload,
    token,
  });

  if (!envelope.data) {
    throw new Error("Group creation returned no data.");
  }

  return envelope.data;
}

export async function joinGroup(
  token: string,
  payload: JoinGroupPayload,
): Promise<JoinGroupResult> {
  const envelope = await apiRequest<JoinGroupResult>("/groups/join", {
    method: "POST",
    body: payload,
    token,
  });

  if (!envelope.data) {
    throw new Error("Join group returned no data.");
  }

  return envelope.data;
}

export async function getGroupDetails(
  token: string,
  groupId: string,
): Promise<GroupDetails> {
  const envelope = await apiRequest<unknown>(`/groups/${groupId}`, {
    token,
  });

  if (!envelope.data) {
    throw new Error("Group details returned no data.");
  }

  const stored = await getStoredGroupMetadata(groupId);
  return finalizeGroupDetails(
    normalizeGroupDetailsFromApi(envelope.data),
    stored?.numberOfParticipants,
  );
}

/** Returns true when the authenticated user created or administers the group. */
export async function isUserGroupCreator(
  token: string,
  groupId: string,
  summary?: GroupSummary,
): Promise<boolean> {
  if (summary?.isCreator) {
    return true;
  }

  const details = await getGroupDetails(token, groupId);
  return details.isCreator === true;
}
