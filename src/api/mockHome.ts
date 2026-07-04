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
    displayName: displayName ?? "Kashi",
    avatarUrl: null,
    group: {
      id: "mock-group-afijo",
      name: "Afijo Community Ajo",
      status: "active",
      cycleFrequency: "weekly",
      amountPerMember: 50_000,
    },
    progress: {
      percent: 70,
      memberCount: 10,
      payoutNumber: 7,
      payoutAmountPaid: 350_000,
      payoutAmountTotal: 500_000,
    },
    payout: {
      date: "2026-07-09T00:00:00.000Z",
      daysRemaining: 4,
    },
    amountRemains: {
      amount: 20_000,
      dueDate: "2026-07-09T00:00:00.000Z",
      daysUntilDue: 5,
    },
    recentActivity: [
      {
        id: "act-1",
        type: "contribution_reminder",
        occurredAt: "2026-06-16T09:30:00.000Z",
      },
      {
        id: "act-2",
        type: "payment_paid",
        occurredAt: "2026-06-16T09:30:00.000Z",
        amount: 10_000,
      },
      {
        id: "act-3",
        type: "upcoming_payout",
        occurredAt: "2026-06-14T09:30:00.000Z",
        recipientName: "Ibrahim sherif",
      },
    ],
  });
}
