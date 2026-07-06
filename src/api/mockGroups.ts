import type { ApiEnvelope } from "../models/auth";
import type { GroupSummary } from "../models/group";

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function success<T>(message: string, data: T): ApiEnvelope<T> {
  return { success: true, message, data };
}

/** New users have no groups — returns empty until join/create is implemented. */
export async function mockGetUserGroups(): Promise<ApiEnvelope<GroupSummary[]>> {
  await mockDelay();
  return success("Groups loaded", []);
}
