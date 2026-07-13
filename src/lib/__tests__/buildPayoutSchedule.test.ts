import { buildPayoutScheduleViewModel } from "../buildPayoutSchedule";
import type { GroupDetails, GroupMember } from "../../models/group";

function member(
  id: string,
  name: string,
  payoutTurn: number,
  contributionStatus?: string,
): GroupMember {
  return {
    id,
    name,
    status: "JOINED",
    payoutTurn,
    contributionStatus,
  };
}

function baseGroup(members: GroupMember[]): GroupDetails {
  return {
    id: "group-1",
    name: "Frontend Peeps",
    inviteCode: "AJO-F6E889",
    numberOfParticipants: 3,
    joinedCount: 3,
    members,
    cycleDetails: {
      cycleId: "cycle-uuid",
      currentCycle: 1,
      potTarget: 1500,
      nextPayoutDate: "2026-07-11T17:37:05.952Z",
    },
    hasActiveCycle: true,
  };
}

describe("buildPayoutScheduleViewModel", () => {
  it("marks next recipient and disables disburse until all members paid", () => {
    const viewModel = buildPayoutScheduleViewModel(
      baseGroup([
        member("m1", "Ada", 1, "PAID"),
        member("m2", "Bob", 2, "PENDING"),
        member("m3", "Chi", 3, "PAID"),
      ]),
    );

    expect(viewModel.nextRecipient?.id).toBe("m1");
    expect(viewModel.scheduleRows.map((row) => row.status)).toEqual([
      "next",
      "upcoming",
      "upcoming",
    ]);
    expect(viewModel.completedRows).toHaveLength(0);
    expect(viewModel.allMembersPaid).toBe(false);
    expect(viewModel.canDisburse).toBe(false);
    expect(viewModel.cycleId).toBe("cycle-uuid");
  });

  it("enables disburse when every member is paid and no payout is processing", () => {
    const viewModel = buildPayoutScheduleViewModel(
      baseGroup([
        member("m1", "Ada", 1, "SUCCESS"),
        member("m2", "Bob", 2, "PAID"),
        member("m3", "Chi", 3, "PAID"),
      ]),
    );

    expect(viewModel.allMembersPaid).toBe(true);
    expect(viewModel.canDisburse).toBe(true);
    expect(viewModel.isProcessing).toBe(false);
  });

  it("shows processing state and disables disburse while round is pending", () => {
    const viewModel = buildPayoutScheduleViewModel(
      baseGroup([
        member("m1", "Ada", 1, "PAID"),
        member("m2", "Bob", 2, "PAID"),
        member("m3", "Chi", 3, "PAID"),
      ]),
      { pendingRound: 1 },
    );

    expect(viewModel.isProcessing).toBe(true);
    expect(viewModel.canDisburse).toBe(false);
    expect(viewModel.scheduleRows[0]?.status).toBe("processing");
  });

  it("moves earlier turns to completed after the round advances", () => {
    const viewModel = buildPayoutScheduleViewModel(
      baseGroup([
        member("m1", "Ada", 1, "PAID"),
        member("m2", "Bob", 2, "PAID"),
        member("m3", "Chi", 3, "PAID"),
      ]),
      { pendingRound: null },
    );

    const advanced = buildPayoutScheduleViewModel({
      ...baseGroup([
        member("m1", "Ada", 1, "PAID"),
        member("m2", "Bob", 2, "PAID"),
        member("m3", "Chi", 3, "PAID"),
      ]),
      cycleDetails: {
        cycleId: "cycle-uuid",
        currentCycle: 2,
        potTarget: 1500,
      },
    });

    expect(viewModel.completedRows).toHaveLength(0);
    expect(advanced.completedRows).toHaveLength(1);
    expect(advanced.completedRows[0]?.member.id).toBe("m1");
    expect(advanced.nextRecipient?.id).toBe("m2");
    expect(advanced.scheduleRows[0]?.status).toBe("next");
  });
});
