import type { ActivityType, RecentActivityItem } from "../models/home";
import { readKoboAsNaira } from "../lib/money";
import { ApiError, apiRequest } from "./client";

type RecentActivityApiItem = {
  id: string;
  type: string;
  occurredAt: string;
  amount?: number;
  recipientName?: string;
  groupId?: string;
  groupName?: string;
};

const ACTIVITY_TYPES: ActivityType[] = [
  "payment_paid",
  "contribution_reminder",
  "upcoming_payout",
];

function normalizeActivityType(raw: string): ActivityType | null {
  const value = raw.trim().toLowerCase();
  if (ACTIVITY_TYPES.includes(value as ActivityType)) {
    return value as ActivityType;
  }

  if (value === "payment" || value === "contribution_paid") {
    return "payment_paid";
  }

  if (value === "reminder" || value === "contribution_due") {
    return "contribution_reminder";
  }

  if (value === "payout" || value === "payout_upcoming") {
    return "upcoming_payout";
  }

  console.warn("[activity] Unrecognized activity type:", raw);
  return null;
}

function normalizeRecentActivityItem(
  raw: RecentActivityApiItem,
): RecentActivityItem | null {
  const type = normalizeActivityType(raw.type);
  if (!type || !raw.id?.trim() || !raw.occurredAt?.trim()) {
    if (raw.type?.trim() && !type) {
      console.warn("[activity] Dropping activity item:", raw.id, raw.type);
    }
    return null;
  }

  return {
    id: raw.id,
    type,
    occurredAt: raw.occurredAt,
    amount: readKoboAsNaira(raw.amount),
    recipientName: raw.recipientName,
    groupId: raw.groupId,
    groupName: raw.groupName,
  };
}

export type ActivityListParams = {
  page?: number;
  limit?: number;
};

/** Fetches recent home activity when the backend endpoint is available. */
export async function getRecentActivity(
  token: string,
  params?: ActivityListParams,
): Promise<RecentActivityItem[]> {
  const search = new URLSearchParams();
  if (params?.page != null) {
    search.set("page", String(params.page));
  }
  if (params?.limit != null) {
    search.set("limit", String(params.limit));
  }

  const query = search.toString();
  const path = query ? `/activity/recent?${query}` : "/activity/recent";

  try {
    const envelope = await apiRequest<RecentActivityApiItem[]>(path, {
      token,
    });

    return (envelope.data ?? [])
      .map(normalizeRecentActivityItem)
      .filter((item): item is RecentActivityItem => item != null);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 501)
    ) {
      return [];
    }

    throw error;
  }
}
