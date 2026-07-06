import { USE_MOCK_AUTH } from "../config/api";
import type { GroupSummary } from "../models/group";
import { apiRequest } from "./client";
import { mockGetUserGroups } from "./mockGroups";

export async function getUserGroups(token: string): Promise<GroupSummary[]> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockGetUserGroups();
    if (!envelope.data) {
      throw new Error("Groups list returned no data.");
    }
    return envelope.data;
  }

  const envelope = await apiRequest<GroupSummary[]>("/groups", { token });
  return envelope.data ?? [];
}
