import {
  isCreatorRole,
  normalizeGroupDetailsFromApi,
  normalizeGroupSummaryFromApi,
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
  it("maps core fields and creator flag", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "group-1",
      name: "Office Ajo",
      inviteCode: "AJO-ABC123",
      isCreator: true,
      contributionAmount: 50000,
      frequency: "MONTHLY",
      memberLimit: 10,
      joinedCount: 3,
    });

    expect(summary).toMatchObject({
      id: "group-1",
      name: "Office Ajo",
      inviteCode: "AJO-ABC123",
      isCreator: true,
      contributionAmount: 50000,
      frequency: "MONTHLY",
      numberOfParticipants: 10,
      joinedCount: 3,
    });
  });

  it("derives creator from role aliases", () => {
    const summary = normalizeGroupSummaryFromApi({
      id: "group-2",
      name: "Family Fund",
      role: "COORDINATOR",
    });

    expect(summary.isCreator).toBe(true);
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
});
