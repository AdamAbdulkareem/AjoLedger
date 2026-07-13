import {
  readCycleContributionStatus,
  resolveGrossTransferBreakdown,
} from "../contributionPayment";

describe("resolveGrossTransferBreakdown", () => {
  it("derives processing fee from gross minus net", () => {
    const breakdown = resolveGrossTransferBreakdown({
      contributionAmount: 100,
      grossContributionAmount: 131,
    });

    expect(breakdown).toEqual({
      netContribution: 100,
      grossTransfer: 131,
      processingFee: 31,
    });
  });

  it("falls back to net when gross is absent", () => {
    const breakdown = resolveGrossTransferBreakdown(
      { contributionAmount: 5_000 },
      5_000,
    );

    expect(breakdown).toEqual({
      netContribution: 5_000,
      grossTransfer: 5_000,
      processingFee: 0,
    });
  });

  it("uses fallback net when cycle contribution is missing", () => {
    const breakdown = resolveGrossTransferBreakdown(undefined, 2_500);

    expect(breakdown.netContribution).toBe(2_500);
    expect(breakdown.grossTransfer).toBe(2_500);
  });
});

describe("readCycleContributionStatus", () => {
  it("prefers activeCycle.myContributionStatus over myDetails", () => {
    const status = readCycleContributionStatus(
      { myContributionStatus: "PAID" },
      { status: "PENDING" },
    );

    expect(status).toBe("PAID");
  });

  it("falls back to myDetails when cycle status is absent", () => {
    const status = readCycleContributionStatus(undefined, {
      status: "SUCCESS",
    });

    expect(status).toBe("SUCCESS");
  });
});
