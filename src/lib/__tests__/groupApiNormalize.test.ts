import {
  isCreatorRole,
  isGroupAdminForCurrentUser,
  normalizeGroupDetailsFromApi,
  normalizeGroupSummaryFromApi,
  resolveGroupDetailsIsCreator,
} from "../groupApiNormalize";

describe("isCreatorRole", () => {
  it("returns true for known creator roles", () => {
    expect(isCreatorRole("ADMIN")).toBe(true);
    expect(isCreatorRole("creator")).toBe(true);
    expect(isCreatorRole("OWNER")).toBe(true);
  });

  it("returns false for member roles", () => {
    expect(isCreatorRole("MEMBER")).toBe(false);
    expect(isCreatorRole(undefined)).toBe(false);
  });
});

describe("normalizeGroupSummaryFromApi", () => {
  it("maps core fields; ignores top-level isCreator for list badges", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "group-1",
      name: "Office Ajo",
      inviteCode: "AJO-ABC123",
      isCreator: true,
      contributionAmount: 5_000_000,
      frequency: "MONTHLY",
      memberLimit: 10,
      joinedCount: 3,
    });

    expect(summary).toMatchObject({
      id: "group-1",
      name: "Office Ajo",
      inviteCode: "AJO-ABC123",
      isCreator: false,
      contributionAmount: 50000,
      frequency: "MONTHLY",
      numberOfParticipants: 10,
      joinedCount: 3,
    });
  });

  it("derives list badge from myDetails.role, not a bare top-level role", () => {
    const fromMyDetails = normalizeGroupSummaryFromApi({
      id: "group-2",
      name: "Family Fund",
      myDetails: { role: "COORDINATOR" },
    });
    expect(fromMyDetails.isCreator).toBe(true);

    const fromTopLevelRole = normalizeGroupSummaryFromApi({
      id: "group-2b",
      name: "Joined Fund",
      role: "OWNER",
    });
    expect(fromTopLevelRole.isCreator).toBe(false);

    const fromTopLevelFlag = normalizeGroupSummaryFromApi({
      id: "group-2c",
      name: "Flagged Joined",
      isCreator: true,
      isAdmin: true,
    });
    expect(fromTopLevelFlag.isCreator).toBe(false);
  });
});

describe("normalizeGroupDetailsFromApi", () => {
  it("normalizes members and invite code", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "group-3",
      name: "Test Group",
      inviteCode: "AJO-XYZ789",
      members: [
        { id: "m1", name: "Ada Lovelace", status: "JOINED" },
        { id: "m2", displayName: "Bob", membershipStatus: "PENDING" },
      ],
      maxParticipants: 5,
    });

    expect(details.inviteCode).toBe("AJO-XYZ789");
    expect(details.members).toHaveLength(2);
    expect(details.members[0]).toMatchObject({
      id: "m1",
      name: "Ada Lovelace",
      status: "JOINED",
    });
    expect(details.members[1]?.status).toBe("PENDING");
    expect(details.numberOfParticipants).toBe(5);
  });

  it("reads payoutTurn from member payloads", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g1",
      name: "Test",
      inviteCode: "AJO-ABCDEF",
      members: [
        { membershipId: "m1", displayName: "Ada", payoutTurn: 2 },
        { id: "m2", name: "Bob", position: 1 },
      ],
    });

    expect(details.members[0]?.payoutTurn).toBe(2);
    expect(details.members[1]?.payoutTurn).toBe(1);
  });

  it("derives isCreator from members[].role matched to current user", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g2",
        name: "Owned Group",
        inviteCode: "AJO-OWNED1",
        members: [
          {
            membershipId: "m-owner",
            displayName: "Adam",
            role: "OWNER",
            userId: "user-1",
            email: "adam@example.com",
          },
          {
            membershipId: "m-member",
            displayName: "Bob",
            role: "MEMBER",
            userId: "user-2",
          },
        ],
      },
      { id: "user-1", email: "adam@example.com" },
    );

    expect(details.isCreator).toBe(true);
    expect(details.members[0]?.role).toBe("OWNER");
  });

  it("does not mark non-owners as creator even with matching identity", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g3",
        name: "Joined Group",
        inviteCode: "AJO-JOIN01",
        members: [
          {
            membershipId: "m-owner",
            displayName: "Owner",
            role: "OWNER",
            userId: "user-owner",
          },
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            userId: "user-1",
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("ignores top-level group role so members are not treated as creators", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g4",
        name: "Shared Group",
        inviteCode: "AJO-SHARE1",
        role: "OWNER",
        isCreator: true,
        members: [
          {
            membershipId: "m-owner",
            displayName: "Owner",
            role: "OWNER",
            userId: "user-owner",
          },
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            userId: "user-1",
            isMe: true,
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("prefers userId over isMe when isMe is set on the owner row for everyone", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g5",
        name: "Buggy isMe Group",
        inviteCode: "AJO-ISME01",
        isCreator: true,
        myDetails: { role: "OWNER" },
        members: [
          {
            membershipId: "m-owner",
            displayName: "Owner",
            role: "OWNER",
            userId: "user-owner",
            isMe: true,
          },
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            userId: "user-1",
            isMe: true,
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("membership MEMBER wins over top-level isCreator / myDetails.role", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g6",
        name: "Flagged Group",
        inviteCode: "AJO-FLAG01",
        isCreator: true,
        isAdmin: true,
        myDetails: { role: "ADMIN" },
        members: [
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            userId: "user-1",
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("never trusts a single isMe row when userId/email are missing", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g7",
        name: "Legacy Group",
        inviteCode: "AJO-LEGACY",
        isCreator: true,
        members: [
          {
            membershipId: "m-owner",
            displayName: "Adam",
            role: "OWNER",
            isMe: true,
          },
          {
            membershipId: "m-other",
            displayName: "Bob",
            role: "MEMBER",
          },
        ],
      },
      { id: "user-1", email: "adam@example.com" },
    );

    // Without identity fields on members, fall through to myDetails — none here → false
    expect(details.isCreator).toBe(false);
  });

  it("does not trust isMe when multiple rows claim it without identity fields", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g8",
        name: "Ambiguous Group",
        inviteCode: "AJO-AMBIG1",
        members: [
          {
            membershipId: "m-owner",
            displayName: "Owner",
            role: "OWNER",
            isMe: true,
          },
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            isMe: true,
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("denies when members have identity but none match the current user", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g9",
        name: "Other Users Group",
        inviteCode: "AJO-OTHER1",
        isCreator: true,
        myDetails: { role: "OWNER" },
        members: [
          {
            membershipId: "m1",
            displayName: "Owner",
            role: "OWNER",
            userId: "user-owner",
          },
          {
            membershipId: "m2",
            displayName: "Someone",
            role: "MEMBER",
            userId: "user-2",
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("denies myDetails.role / createdBy fallbacks — members[].role only", () => {
    const viaMyDetails = normalizeGroupDetailsFromApi(
      {
        id: "g10",
        name: "No Identity Members",
        inviteCode: "AJO-NOID01",
        myDetails: { role: "COORDINATOR" },
        members: [
          { membershipId: "m1", displayName: "Adam", role: "OWNER" },
          { membershipId: "m2", displayName: "Bob", role: "MEMBER" },
        ],
      },
      { id: "user-1", email: "adam@example.com" },
    );
    expect(viaMyDetails.isCreator).toBe(false);

    const viaCreatedBy = normalizeGroupDetailsFromApi(
      {
        id: "g11",
        name: "Empty Members",
        inviteCode: "AJO-EMPTY1",
        createdBy: "user-1",
        isCreator: true,
        members: [],
      },
      { id: "user-1", email: "adam@example.com" },
    );
    expect(viaCreatedBy.isCreator).toBe(false);
  });

  it("denies empty members with only top-level isCreator for a different user", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g12",
        name: "Flag Only",
        inviteCode: "AJO-FLAG02",
        isCreator: true,
        isAdmin: true,
        createdBy: "user-owner",
        members: [],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
  });

  it("denies without current user identity even if flags say creator", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g13",
      name: "No Identity",
      inviteCode: "AJO-NOUSR1",
      isCreator: true,
      myDetails: { role: "OWNER" },
      members: [
        {
          membershipId: "m1",
          displayName: "Adam",
          role: "OWNER",
          userId: "user-1",
          isMe: true,
        },
      ],
    });

    expect(details.isCreator).toBe(false);
  });

  it("ignores nested user.role so account roles do not grant group admin", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g14",
        name: "Nested Role",
        inviteCode: "AJO-NEST01",
        members: [
          {
            membershipId: "m-me",
            displayName: "Adam",
            role: "MEMBER",
            userId: "user-1",
            user: { id: "user-1", role: "OWNER" },
          },
        ],
      },
      { id: "user-1" },
    );

    expect(details.isCreator).toBe(false);
    expect(details.members[0]?.role).toBe("MEMBER");
  });

  it("live API: COORDINATOR creator vs CONTRIBUTOR joiner by email", () => {
    const payload = {
      id: "9361d44c-d25c-45e6-9655-f0c0073fd81b",
      name: "Hadam Ajo Group",
      description: "savings",
      inviteCode: "AJO-F87C45",
      activeCycle: null,
      myDetails: {
        virtualAccountNumber: "8457658887",
        virtualBankName: "Nombank MFB",
        virtualAccountName: "Nomba/Ajo HadamAjoGroup",
      },
      members: [
        {
          membershipId: "08824d35-9991-4f2b-a991-ca1749c4351d",
          email: "hadam@gmail.com",
          role: "COORDINATOR",
          payoutTurn: null,
        },
        {
          membershipId: "e710f09f-9feb-40ce-af5d-e4e36994165d",
          email: "dmabdulkareem@gmail.com",
          role: "CONTRIBUTOR",
          payoutTurn: null,
        },
      ],
    };

    const creator = normalizeGroupDetailsFromApi(payload, {
      id: "any-id",
      email: "hadam@gmail.com",
    });
    const joiner = normalizeGroupDetailsFromApi(payload, {
      id: "any-other-id",
      email: "dmabdulkareem@gmail.com",
    });

    expect(creator.isCreator).toBe(true);
    expect(joiner.isCreator).toBe(false);
    expect(
      isGroupAdminForCurrentUser(joiner, {
        email: "dmabdulkareem@gmail.com",
      }),
    ).toBe(false);
    expect(
      isGroupAdminForCurrentUser(creator, { email: "hadam@gmail.com" }),
    ).toBe(true);
  });

  it("prefers email match over userId when roster has emails", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g15",
        name: "Email First",
        inviteCode: "AJO-EMAIL1",
        members: [
          {
            membershipId: "m-coord",
            email: "owner@example.com",
            role: "COORDINATOR",
            userId: "wrong-id",
          },
          {
            membershipId: "m-me",
            email: "joiner@example.com",
            role: "CONTRIBUTOR",
            userId: "user-1",
          },
        ],
      },
      { id: "user-1", email: "joiner@example.com" },
    );

    expect(details.isCreator).toBe(false);
  });
});

describe("contribution payment status", () => {
  it("maps myDetails.paymentStatus into status on list payloads", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g-pay",
      name: "Paid Group",
      myDetails: { paymentStatus: "SUCCESS" },
    });

    expect(summary.myDetails?.status).toBe("SUCCESS");
  });

  it("merges member paymentStatus into myDetails when status is missing", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g-pay2",
        name: "Paid Detail",
        inviteCode: "AJO-PAY002",
        myDetails: { virtualAccountNumber: "1234567890" },
        members: [
          {
            membershipId: "m1",
            email: "user@example.com",
            role: "COORDINATOR",
            paymentStatus: "PAID",
          },
        ],
      },
      { email: "user@example.com" },
    );

    expect(details.myDetails?.status).toBe("PAID");
  });

  it("prefers myDetails.status over member paymentStatus", () => {
    const details = normalizeGroupDetailsFromApi(
      {
        id: "g-pay3",
        name: "Mixed Detail",
        inviteCode: "AJO-PAY003",
        myDetails: { status: "PARTIAL" },
        members: [
          {
            membershipId: "m1",
            email: "user@example.com",
            role: "COORDINATOR",
            paymentStatus: "PAID",
          },
        ],
      },
      { email: "user@example.com" },
    );

    expect(details.myDetails?.status).toBe("PARTIAL");
  });
});

describe("API money (kobo → naira)", () => {
  it("converts group contributionAmount from kobo", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g-money",
      name: "Money Group",
      contributionAmount: 5_000_000,
    });

    expect(summary.contributionAmount).toBe(50_000);
  });

  it("converts cycleDetails money fields from kobo", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g-cycle-money",
      name: "Cycle Money",
      inviteCode: "AJO-MONEY1",
      cycleDetails: {
        currentCycle: 1,
        contributionAmount: 500_000,
        potCollected: 1_000_000,
        potTarget: 5_000_000,
      },
      members: [],
    });

    expect(details.cycleDetails).toMatchObject({
      contributionAmount: 5_000,
      potCollected: 10_000,
      potTarget: 50_000,
    });
  });

  it("reads grossContributionAmount and myContributionStatus from activeCycle", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g-gross",
      name: "Gross Group",
      inviteCode: "AJO-GROSS1",
      activeCycle: {
        id: "cycle-1",
        currentCycle: 1,
        status: "ACTIVE",
        contributionAmount: 1_000_000,
        grossContributionAmount: 1_310_000,
        myContributionStatus: "PENDING",
      },
      members: [],
    });

    expect(details.cycleDetails).toMatchObject({
      contributionAmount: 10_000,
      grossContributionAmount: 13_100,
      myContributionStatus: "PENDING",
    });
  });

  it("converts member dueAmount from kobo", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g-due",
      name: "Due Group",
      inviteCode: "AJO-DUE001",
      members: [
        {
          id: "m1",
          name: "Ada",
          dueAmount: 250_000,
        },
      ],
    });

    expect(details.members[0]?.dueAmount).toBe(2_500);
  });

  it("converts myDetails amountDue from kobo on list payloads", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g-list-due",
      name: "List Due",
      myDetails: {
        status: "PARTIAL",
        amountDue: 125_000,
      },
    });

    expect(summary.myDetails?.dueAmount).toBe(1_250);
  });
});

describe("resolveGroupDetailsIsCreator", () => {
  it("never grants access from top-level isCreator alone", () => {
    expect(
      resolveGroupDetailsIsCreator({ isCreator: true, isAdmin: true }, [], {
        id: "user-1",
      }),
    ).toBe(false);
  });
});

describe("active cycle detection", () => {
  it("marks pre-cycle groups when activeCycle is null", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g-pre",
      name: "Pre Cycle",
      inviteCode: "AJO-PRE001",
      activeCycle: null,
      members: [],
    });

    expect(details.hasActiveCycle).toBe(false);
  });

  it("marks active cycle from activeCycle payload", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g-live",
      name: "Live Cycle",
      inviteCode: "AJO-LIVE01",
      activeCycle: {
        id: "cycle-1",
        currentCycle: 1,
        currentWeek: 2,
        status: "ACTIVE",
      },
      members: [],
    });

    expect(details.hasActiveCycle).toBe(true);
    expect(details.cycleDetails?.currentWeek).toBe(2);
  });

  it("marks active cycle from cycleDetails.currentCycle fallback", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "g-sum",
      name: "Summary",
      cycleDetails: { currentCycle: 1, potCollected: 100000 },
    });

    expect(summary.hasActiveCycle).toBe(true);
  });

  it.each(["DRAFT", "PENDING_SETUP"] as const)(
    "excludes activeCycle with status %s",
    (status) => {
      const details = normalizeGroupDetailsFromApi({
        id: `g-${status}`,
        name: "Draft Cycle",
        inviteCode: "AJO-DRAFT1",
        activeCycle: {
          id: "cycle-draft",
          currentCycle: 1,
          status,
        },
        members: [],
      });

      expect(details.hasActiveCycle).toBe(false);
    },
  );
});

describe("live API: Frontend Peeps active cycle shape", () => {
  const listPayload = {
    id: "20d07618-75b0-46f9-8204-f280fa7e02f3",
    name: "Frontend Peeps",
    inviteCode: "AJO-F6E889",
    cycleDetails: {
      currentCycle: 1,
      contributionAmount: 50_000,
      potCollected: 0,
      potTarget: 150_000,
      startedAt: "2026-07-11T17:37:05.952Z",
      nextPayoutDate: "2026-07-18T17:37:05.532Z",
    },
    myDetails: {
      position: 3,
      status: "PENDING",
      virtualAccountNumber: "7725173606",
      virtualBankName: "Nombank MFB",
      virtualAccountName: "Nomba/Ajo FrontendPeeps",
    },
  };

  const detailPayload = {
    id: "20d07618-75b0-46f9-8204-f280fa7e02f3",
    name: "Frontend Peeps",
    description: "Savings",
    inviteCode: "AJO-F6E889",
    activeCycle: {
      id: "66eba215-08c9-4ebd-868e-92cd3c7e9ac9",
      contributionAmountKobo: 50_000,
      totalRounds: 3,
      currentRound: 1,
      isActive: true,
      startedAt: "2026-07-11T17:37:05.952Z",
      nextPayoutDate: "2026-07-18T17:37:05.532Z",
      groupId: "20d07618-75b0-46f9-8204-f280fa7e02f3",
      grossContributionAmount: 52_200,
      myContributionStatus: "PENDING",
    },
    myDetails: {
      virtualAccountNumber: "7725173606",
      virtualBankName: "Nombank MFB",
      virtualAccountName: "Nomba/Ajo FrontendPeeps",
    },
    members: [
      {
        membershipId: "f44eda2d-7680-4045-8d06-9de0d771251f",
        firstName: "Adam",
        lastName: "Abdulkareem",
        email: "abdulkareem@gmail.com",
        role: "CONTRIBUTOR",
        payoutTurn: 1,
        virtualAccountName: "Nomba/Ajo FrontendPeeps",
      },
      {
        membershipId: "3b3437fe-1963-49ee-adbf-ea48d4ce5aea",
        firstName: "Damilare",
        lastName: "Oluwaseun",
        email: "oluwadamilare@gmail.com",
        role: "CONTRIBUTOR",
        payoutTurn: 2,
      },
      {
        membershipId: "55155ea6-4b72-4d5d-aa47-93e446202757",
        firstName: "Adam",
        lastName: "Coordinator",
        email: "dmabdulkareem@gmail.com",
        role: "COORDINATOR",
        payoutTurn: 3,
      },
    ],
  };

  it("maps list cycleDetails into summary card fields", () => {
    const summary = normalizeGroupSummaryFromApi(listPayload);

    expect(summary.hasActiveCycle).toBe(true);
    expect(summary.joinedCount).toBe(3);
    expect(summary.numberOfParticipants).toBe(3);
    expect(summary.cycleDetails).toMatchObject({
      currentCycle: 1,
      contributionAmount: 500,
      potCollected: 0,
      potTarget: 1500,
      nextPayoutDate: "2026-07-18T17:37:05.532Z",
    });
    expect(summary.myDetails?.position).toBe(3);
  });

  it("maps activeCycle aliases on group detail", () => {
    const details = normalizeGroupDetailsFromApi(detailPayload, {
      email: "abdulkareem@gmail.com",
    });

    expect(details.hasActiveCycle).toBe(true);
    expect(details.joinedCount).toBe(3);
    expect(details.numberOfParticipants).toBe(3);
    expect(details.cycleDetails).toMatchObject({
      cycleId: "66eba215-08c9-4ebd-868e-92cd3c7e9ac9",
      currentCycle: 1,
      currentWeek: 1,
      totalWeeks: 3,
      contributionAmount: 500,
      grossContributionAmount: 522,
      myContributionStatus: "PENDING",
      nextPayoutDate: "2026-07-18T17:37:05.532Z",
    });
    expect(details.contributionAmount).toBe(500);
    expect(details.members[0]?.name).toBe("Adam Abdulkareem");
    expect(details.members[1]?.name).toBe("Damilare Oluwaseun");
  });

  it("prefers member firstName/lastName over virtualAccountName", () => {
    const details = normalizeGroupDetailsFromApi({
      id: "g1",
      name: "Test",
      inviteCode: "AJO-TEST01",
      members: [
        {
          membershipId: "m1",
          firstName: "Sherif",
          lastName: "Ibrahim",
          email: "sherif.ibrahim@nomba.com",
          virtualAccountName: "Nomba/Ajo FrontendPeeps",
        },
      ],
    });

    expect(details.members[0]?.name).toBe("Sherif Ibrahim");
  });
});
