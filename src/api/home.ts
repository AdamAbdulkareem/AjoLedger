import { USE_MOCK_AUTH } from "../config/api";
import type { HomeDashboard } from "../models/home";
import { apiRequest } from "./client";
import { mockGetHomeDashboard } from "./mockHome";

/**
 * Dashboard summary — confirm aggregated vs split endpoints with backend.
 * TODO(backend): verify `/dashboard/home` matches Sherif's contract.
 */
export async function getHomeDashboard(
  token: string,
  displayName?: string,
): Promise<HomeDashboard> {
  if (USE_MOCK_AUTH) {
    const envelope = await mockGetHomeDashboard(displayName);
    if (!envelope.data) {
      throw new Error("Mock dashboard returned no data.");
    }
    return envelope.data;
  }

  const envelope = await apiRequest<HomeDashboard>("/dashboard/home", { token });
  if (!envelope.data) {
    throw new Error("Dashboard returned no data.");
  }
  return envelope.data;
}
