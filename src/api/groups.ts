import type {
  AssignPayoutOrderPayload,
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
  isGroupAdminForCurrentUser,
  type CurrentUserIdentity,
} from "../lib/groupApiNormalize";
import { syncCreatorBadge } from "../lib/creatorGroupsStorage";
import { getAllGroupMetadata, getStoredGroupMetadata } from "../lib/groupMetadataStorage";
import { getJoinedMembers } from "../lib/groupMembers";
import {
  createdGroupSchema,
  joinGroupResultSchema,
} from "../lib/schemas/apiSchemas";
import { validateApiPayload, validateGroupSummaries } from "../lib/validateApiResponse";
import { apiRequest } from "./client";

export const GROUPS_PAGE_SIZE = 20;

export type GroupsListParams = {
  page?: number;
  limit?: number;
};

function resolveParticipantCount(
  apiCount: number,
  joinedCount: number,
  storedCount?: number,
  routeExpected?: number,
): number {
  const stored = storedCount && storedCount > 0 ? storedCount : 0;
  const route = routeExpected && routeExpected > 0 ? routeExpected : 0;

  // When apiCount equals joinedCount, the API likely sent current members — not capacity.
  const apiCapacity = apiCount > joinedCount ? apiCount : 0;

  return Math.max(stored, route, apiCapacity, joinedCount, 1);
}

function finalizeGroupDetails(
  raw: GroupDetails,
  storedParticipantCount?: number,
  routeExpected?: number,
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
      routeExpected,
    ),
  };
}

export async function getUserGroups(
  token: string,
  params?: GroupsListParams,
): Promise<GroupSummary[]> {
  const search = new URLSearchParams();
  if (params?.page != null) {
    search.set("page", String(params.page));
  }
  if (params?.limit != null) {
    search.set("limit", String(params.limit));
  }

  const query = search.toString();
  const path = query ? `/groups?${query}` : "/groups";
  const envelope = await apiRequest<unknown[]>(path, { token });
  const groups = (envelope.data ?? []).map(normalizeGroupSummaryFromApi);
  validateGroupSummaries(groups);
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
    // POST /groups is the API exception: send contributionAmount in naira.
    // Backend converts to kobo before persisting; GET responses return kobo.
    body: payload,
    token,
  });

  if (!envelope.data) {
    throw new Error("Group creation returned no data.");
  }

  return validateApiPayload(
    createdGroupSchema,
    envelope.data,
    "Group creation failed.",
  );
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

  return validateApiPayload(
    joinGroupResultSchema,
    envelope.data,
    "Join group failed.",
  );
}

export async function getGroupDetails(
  token: string,
  groupId: string,
  options?: {
    expectedParticipants?: number;
    currentUser?: CurrentUserIdentity | null;
    /** When false, skip AsyncStorage creator-badge sync (caller syncs separately). */
    syncCreatorBadge?: boolean;
  },
): Promise<GroupDetails> {
  const envelope = await apiRequest<unknown>(`/groups/${groupId}`, {
    token,
  });

  if (!envelope.data) {
    throw new Error("Group details returned no data.");
  }

  const stored = await getStoredGroupMetadata(groupId);
  // Access is decided only by normalizeGroupDetailsFromApi (membership role).
  // Never promote via device memory for Invite/Payout.
  const details = finalizeGroupDetails(
    normalizeGroupDetailsFromApi(envelope.data, options?.currentUser),
    stored?.numberOfParticipants,
    options?.expectedParticipants,
  );

  // Badge sync only: keep per-user creator hints aligned with membership role.
  const userId = options?.currentUser?.id;
  if (userId && options?.syncCreatorBadge !== false) {
    await syncCreatorBadge(userId, details.id, details, options?.currentUser);
  }

  return details;
}

/** Returns true when the authenticated user created or administers the group. */
export async function isUserGroupCreator(
  token: string,
  groupId: string,
  _summary?: GroupSummary,
  currentUser?: CurrentUserIdentity | null,
): Promise<boolean> {
  if (!currentUser?.email && !currentUser?.id) {
    return false;
  }

  // Always re-check matched members[].role — never trust a cached isCreator flag.
  const details = await getGroupDetails(token, groupId, { currentUser });
  return isGroupAdminForCurrentUser(details, currentUser);
}

/** Admin assigns 1-indexed payout turns for every joined member. */
export async function assignPayoutOrder(
  token: string,
  groupId: string,
  payload: AssignPayoutOrderPayload,
): Promise<void> {
  await apiRequest(`/groups/${groupId}/payout-order`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

/** Coordinator starts a new savings cycle for the group. */
export async function startGroupCycle(
  token: string,
  groupId: string,
): Promise<void> {
  await apiRequest(`/groups/${groupId}/cycles`, {
    method: "POST",
    token,
  });
}

export type CyclePaymentStatus = "PENDING" | "PAID";

export type DisburseCycleResult = {
  payoutId: string;
  merchantTxRef: string;
  amountKobo: number;
  nombaStatus: string;
  round: number;
};

/** Coordinator triggers async Nomba payout to the current round beneficiary. */
export async function disburseCyclePayout(
  token: string,
  groupId: string,
  cycleId: string,
  transactionPin: string,
): Promise<DisburseCycleResult> {
  const envelope = await apiRequest<DisburseCycleResult>(
    `/groups/${groupId}/cycles/${cycleId}/disburse`,
    {
      method: "POST",
      body: { transactionPin },
      token,
    },
  );

  if (!envelope.data) {
    throw new Error("Payout disbursement returned no data.");
  }

  return envelope.data;
}

/** Lightweight poll while waiting for Nomba inbound transfer to settle. */
export async function getCurrentCyclePaymentStatus(
  token: string,
  groupId: string,
): Promise<{ status: CyclePaymentStatus }> {
  const envelope = await apiRequest<{ status?: string }>(
    `/groups/${groupId}/cycles/current/payment-status`,
    { token },
  );

  const raw = envelope.data?.status?.trim().toUpperCase();
  return {
    status: raw === "PAID" ? "PAID" : "PENDING",
  };
}
