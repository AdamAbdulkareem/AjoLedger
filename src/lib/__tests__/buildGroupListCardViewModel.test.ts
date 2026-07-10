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

  it.each(["PARTIAL", "PARTIALLY_PAID", "UNDERPAID"] as const)(
    "maps %s to partial",
    (status) => {
      expect(mapContributionStatusKey(status)).toBe("partial");
    },
  );

  it("maps pending states to notPaid", () => {
    expect(mapContributionStatusKey("PENDING")).toBe("notPaid");
    expect(mapContributionStatusKey("NOT_PAID")).toBe("notPaid");
  });
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
});
