import { normalizeGroupSummaryFromApi } from "../groupApiNormalize";
import {
  buildGroupListCardViewModel,
  mapContributionStatusKey,
} from "../buildGroupListCardViewModel";

describe("mapContributionStatusKey", () => {
  it.each(["PAID", "COMPLETE", "SUCCESS", "CONFIRMED", "SETTLED"] as const)(
    "maps %s to paid",
    (status) => {
      expect(mapContributionStatusKey(status)).toBe("paid");
    },
  );

  it.each(["PARTIAL", "PARTIALLY_PAID", "UNDERPAID", "PENDING", "NOT_PAID"] as const)(
    "maps %s to notPaid",
    (status) => {
      expect(mapContributionStatusKey(status)).toBe("notPaid");
    },
  );
});

describe("buildGroupListCardViewModel", () => {
  it("reads myDetails.paymentStatus when status is absent", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g1",
      name: "Test",
      myDetails: {
        paymentStatus: "SUCCESS",
        virtualAccountNumber: "1234567890",
      },
    });
    const viewModel = buildGroupListCardViewModel(summary);

    expect(viewModel.statusKey).toBe("paid");
  });

  it("uses explicit dueDate for contributionDueDate", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g1",
      name: "Partial Group",
      cycleDetails: {
        contributionAmount: 500_000,
        dueDate: "2026-07-20",
      },
      myDetails: {
        status: "PARTIAL",
        amountDue: 150_000,
      },
    });
    const viewModel = buildGroupListCardViewModel(summary);

    expect(viewModel.statusKey).toBe("notPaid");
    expect(viewModel.contributionDueDate).toBe("2026-07-20");
    expect(viewModel.nextPayoutDate).toBe("");
  });

  it("derives contributionDueDate as day before nextPayoutDate", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g3",
      name: "Weekly Group",
      cycleDetails: {
        nextPayoutDate: "2026-07-18T17:37:05.532Z",
      },
    });
    const viewModel = buildGroupListCardViewModel(summary);

    expect(viewModel.nextPayoutDate).toBe("2026-07-18T17:37:05.532Z");
    expect(viewModel.contributionDueDate.startsWith("2026-07-17")).toBe(true);
  });

  it("uses gross transfer for amountRemaining when unpaid", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g4",
      name: "Gross Group",
      cycleDetails: {
        contributionAmount: 50_000,
        grossContributionAmount: 52_200,
        myContributionStatus: "PENDING",
      },
    });
    const viewModel = buildGroupListCardViewModel(summary);

    expect(viewModel.statusKey).toBe("notPaid");
    expect(viewModel.amountRemaining).toBe(522);
  });

  it("prefers cycle myContributionStatus over myDetails status", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g2",
      name: "Cycle Status",
      cycleDetails: {
        currentCycle: 1,
        myContributionStatus: "PAID",
      },
      myDetails: {
        status: "PENDING",
      },
    });
    const viewModel = buildGroupListCardViewModel(summary);

    expect(viewModel.statusKey).toBe("paid");
    expect(viewModel.amountRemaining).toBe(0);
  });
});
