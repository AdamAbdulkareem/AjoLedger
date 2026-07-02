import type { ApiEnvelope } from "../models/auth";
import type { HomeDashboard } from "../models/home";

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function success<T>(message: string, data: T): ApiEnvelope<T> {
  return { success: true, message, data };
}

export async function mockGetHomeDashboard(
  displayName?: string,
): Promise<ApiEnvelope<HomeDashboard>> {
  await mockDelay();

  return success("Dashboard loaded", {
    displayName: displayName ?? "Amina",
    avatarUrl: null,
    group: {
      id: "mock-group-kano",
      name: "Kano Market Women Ajo",
      status: "active",
      cycleFrequency: "monthly",
      amountPerMember: 10_000,
    },
    progress: {
      percent: 70,
      amountPaid: 140_000,
      expectedTotal: 200_000,
    },
    payout: {
      date: "2025-05-28T00:00:00.000Z",
      daysRemaining: 3,
    },
    nextContribution: {
      amount: 10_000,
      dueDate: "2025-05-20T00:00:00.000Z",
      daysUntilDue: 5,
    },
    recentActivity: [
      {
        id: "act-1",
        type: "payment_received",
        occurredAt: "2025-05-15T08:30:00.000Z",
        amount: 10_000,
      },
      {
        id: "act-2",
        type: "contribution_reminder",
        occurredAt: "2025-05-20T00:00:00.000Z",
        showChevron: true,
      },
      {
        id: "act-3",
        type: "upcoming_payout",
        occurredAt: "2025-05-28T00:00:00.000Z",
        recipientName: "Aisha Bello",
        showChevron: true,
      },
    ],
  });
}
