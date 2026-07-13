import {
  resolveContributionDueDate,
  resolveOutstandingContribution,
} from "../resolveOutstandingContribution";

describe("resolveOutstandingContribution", () => {
  it("returns zero when fully paid", () => {
    expect(
      resolveOutstandingContribution({
        contributionAmount: 5000,
        statusKey: "paid",
        grossTransferAmount: 5220,
      }),
    ).toBe(0);
  });

  it("returns gross transfer when unpaid", () => {
    expect(
      resolveOutstandingContribution({
        contributionAmount: 5000,
        statusKey: "notPaid",
        grossTransferAmount: 5220,
      }),
    ).toBe(5220);
  });

  it("falls back to net contribution when gross is absent", () => {
    expect(
      resolveOutstandingContribution({
        contributionAmount: 5000,
        statusKey: "notPaid",
      }),
    ).toBe(5000);
  });
});

describe("resolveContributionDueDate", () => {
  it("prefers dueDate over nextPayoutDate", () => {
    expect(
      resolveContributionDueDate("2026-07-15", "2026-07-20"),
    ).toBe("2026-07-15");
  });

  it("falls back to day before nextPayoutDate", () => {
    const due = resolveContributionDueDate(undefined, "2026-07-18T17:37:05.532Z");
    expect(due.startsWith("2026-07-17")).toBe(true);
  });

  it("returns empty when neither date is provided", () => {
    expect(resolveContributionDueDate(undefined, undefined)).toBe("");
  });
});
