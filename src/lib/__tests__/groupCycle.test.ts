import { hasActiveGroupCycle } from "../groupCycle";
import type { GroupSummary } from "../../models/group";

describe("hasActiveGroupCycle", () => {
  it("returns true when hasActiveCycle flag is set", () => {
    const group: GroupSummary = {
      id: "g1",
      name: "Test",
      hasActiveCycle: true,
    };

    expect(hasActiveGroupCycle(group)).toBe(true);
  });

  it("returns true when cycleDetails.currentCycle is at least 1", () => {
    const group: GroupSummary = {
      id: "g2",
      name: "Test",
      cycleDetails: { currentCycle: 1 },
    };

    expect(hasActiveGroupCycle(group)).toBe(true);
  });

  it("returns false for pre-cycle groups", () => {
    const group: GroupSummary = {
      id: "g3",
      name: "Test",
      hasActiveCycle: false,
      cycleDetails: undefined,
    };

    expect(hasActiveGroupCycle(group)).toBe(false);
  });
});
