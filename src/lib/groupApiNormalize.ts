import type {
  GroupCycleDetails,
  GroupDetails,
  GroupMember,
  GroupMyDetails,
  GroupSummary,
} from "../models/group";
import { deriveDisplayName } from "./greeting";
import { readKoboAsNaira } from "./money";

const CREATOR_ROLES = new Set([
  "ADMIN",
  "COORDINATOR",
  "CREATOR",
  "OWNER",
  "ORGANIZER",
]);

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readMoneyFromApi(value: unknown): number | undefined {
  return readKoboAsNaira(value);
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function isCreatorRole(role: string | undefined): boolean {
  if (!role) {
    return false;
  }
  return CREATOR_ROLES.has(role.trim().toUpperCase());
}

/**
 * List-card badge hint only (GET /groups has no members[]).
 * Trust only per-user myDetails.role — never top-level isCreator/isAdmin
 * (those have been stamped incorrectly for joiners).
 * Invite/Payout access must still use isGroupAdminForCurrentUser.
 */
function readListCreatorHint(raw: UnknownRecord): boolean {
  const myDetails = asRecord(raw.myDetails);
  if (!myDetails) {
    return false;
  }

  const myRole =
    readString(myDetails.role) ??
    readString(myDetails.membershipRole) ??
    readString(myDetails.userRole);

  return isCreatorRole(myRole);
}

function readFrequency(raw: UnknownRecord): GroupSummary["frequency"] {
  const value = (
    readString(raw.frequency) ?? readString(raw.contributionFrequency)
  )?.toUpperCase();

  if (value === "DAILY" || value === "WEEKLY" || value === "MONTHLY") {
    return value;
  }

  return undefined;
}

function readJoinedCount(raw: UnknownRecord, members?: GroupMember[]): number {
  const direct =
    readNumber(raw.joinedCount) ??
    readNumber(raw.membersJoined) ??
    readNumber(raw.joinedMembersCount);

  if (direct != null) {
    return direct;
  }

  if (members?.length) {
    return members.filter(
      (member) => String(member.status).toUpperCase() === "JOINED",
    ).length;
  }

  return 0;
}

function readParticipantCount(raw: UnknownRecord): number {
  const direct =
    readNumber(raw.numberOfParticipants) ??
    readNumber(raw.participantCount) ??
    readNumber(raw.totalParticipants) ??
    readNumber(raw.maxParticipants) ??
    readNumber(raw.expectedParticipants) ??
    readNumber(raw.maxMembers) ??
    readNumber(raw.memberLimit) ??
    readNumber(raw.capacity);

  if (direct != null && direct > 0) {
    return direct;
  }

  const activeCycle = asRecord(raw.activeCycle);
  if (activeCycle) {
    const fromCycle =
      readNumber(activeCycle.numberOfParticipants) ??
      readNumber(activeCycle.participantCount) ??
      readNumber(activeCycle.maxParticipants);

    if (fromCycle != null && fromCycle > 0) {
      return fromCycle;
    }
  }

  const cycleDetails = asRecord(raw.cycleDetails);
  if (cycleDetails) {
    const fromCycleDetails =
      readNumber(cycleDetails.numberOfParticipants) ??
      readNumber(cycleDetails.participantCount) ??
      readNumber(cycleDetails.maxParticipants);

    if (fromCycleDetails != null && fromCycleDetails > 0) {
      return fromCycleDetails;
    }
  }

  return 0;
}

function readVirtualAccountDisplayName(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const separatorIndex = trimmed.indexOf(" - ");
  if (separatorIndex >= 0) {
    const extracted = trimmed.slice(separatorIndex + 3).trim();
    if (extracted) {
      return extracted;
    }
  }

  return trimmed;
}

function readMemberName(member: UnknownRecord): string {
  const user = asRecord(member.user);
  const profile = asRecord(member.profile);

  const directName =
    readString(member.name) ??
    readString(member.fullName) ??
    readString(member.displayName) ??
    readString(member.userName) ??
    readString(member.memberName);

  if (directName) {
    return directName;
  }

  if (user) {
    const userName =
      readString(user.name) ??
      readString(user.fullName) ??
      readString(user.displayName);

    if (userName) {
      return userName;
    }

    const fromUserEmail = deriveDisplayName(readString(user.email));
    if (fromUserEmail) {
      return fromUserEmail;
    }
  }

  if (profile) {
    const profileName =
      readString(profile.fullName) ??
      readString(profile.name) ??
      readString(profile.displayName);

    if (profileName) {
      return profileName;
    }
  }

  const fromVirtualAccount = readVirtualAccountDisplayName(
    readString(member.virtualAccountName),
  );
  if (fromVirtualAccount) {
    return fromVirtualAccount;
  }

  const fromEmail =
    deriveDisplayName(readString(member.email)) ??
    deriveDisplayName(readString(member.userEmail));
  if (fromEmail) {
    return fromEmail;
  }

  return "Member";
}

function readMyDetails(raw: UnknownRecord): GroupMyDetails | undefined {
  const myDetails = asRecord(raw.myDetails);
  if (!myDetails) {
    return undefined;
  }

  const position = readNumber(myDetails.position);
  const virtualAccountNumber = readString(myDetails.virtualAccountNumber);
  const virtualBankName = readString(myDetails.virtualBankName);
  const virtualAccountName = readString(myDetails.virtualAccountName);
  const status =
    readString(myDetails.status) ??
    readString(myDetails.paymentStatus) ??
    readString(myDetails.contributionStatus) ??
    readString(myDetails.weekStatus);
  const role =
    readString(myDetails.role) ??
    readString(myDetails.membershipRole) ??
    readString(myDetails.userRole);

  if (
    position == null &&
    !virtualAccountNumber &&
    !virtualBankName &&
    !virtualAccountName &&
    !status &&
    !role
  ) {
    return undefined;
  }

  return {
    position: position ?? null,
    status,
    role,
    virtualAccountNumber,
    virtualBankName,
    virtualAccountName,
  };
}

/** When myDetails lacks status, use the matched membership row from GET /groups/:id. */
function mergeMyDetailsWithMemberStatus(
  myDetails: GroupMyDetails | undefined,
  members: GroupMember[],
  currentUser?: CurrentUserIdentity | null,
): GroupMyDetails | undefined {
  if (myDetails?.status?.trim()) {
    return myDetails;
  }

  const myRows = findMyMembershipRows(members, currentUser);
  const memberStatus = myRows
    .map((row) => row.contributionStatus)
    .find((value) => typeof value === "string" && value.trim());

  if (!memberStatus) {
    return myDetails;
  }

  return {
    ...(myDetails ?? {}),
    status: String(memberStatus),
  };
}

function readHasActiveCycle(raw: UnknownRecord): boolean {
  const activeCycle = asRecord(raw.activeCycle);
  if (activeCycle && Object.keys(activeCycle).length > 0) {
    const status = readString(activeCycle.status)?.toUpperCase();
    if (status === "DRAFT" || status === "PENDING_SETUP") {
      return false;
    }
    return true;
  }

  const cycleDetails = asRecord(raw.cycleDetails);
  if (cycleDetails) {
    const currentCycle = readNumber(cycleDetails.currentCycle);
    if (currentCycle != null && currentCycle >= 1) {
      return true;
    }
  }

  return false;
}

function readCycleDetails(raw: UnknownRecord): GroupCycleDetails | undefined {
  const cycleDetails = asRecord(raw.cycleDetails);
  const activeCycle = asRecord(raw.activeCycle);
  const source = cycleDetails ?? activeCycle;

  if (!source) {
    return undefined;
  }

  const currentCycle = readNumber(source.currentCycle);
  const currentWeek =
    readNumber(source.currentWeek) ??
    readNumber(source.week) ??
    readNumber(source.weekNumber) ??
    currentCycle;
  const totalWeeks =
    readNumber(source.totalWeeks) ??
    readNumber(source.numberOfWeeks) ??
    readNumber(source.numberOfParticipants) ??
    readNumber(source.participantCount);
  const contributionAmount = readMoneyFromApi(source.contributionAmount);
  const potCollected = readMoneyFromApi(source.potCollected);
  const potTarget = readMoneyFromApi(source.potTarget);
  const nextPayoutDate = readString(source.nextPayoutDate);
  const dueDate =
    readString(source.dueDate) ??
    readString(source.contributionDueDate) ??
    nextPayoutDate;
  const expectedAmount =
    readMoneyFromApi(source.expectedAmount) ??
    potTarget ??
    (contributionAmount != null && totalWeeks != null
      ? contributionAmount * totalWeeks
      : undefined);

  if (
    currentCycle == null &&
    currentWeek == null &&
    contributionAmount == null &&
    potCollected == null &&
    potTarget == null &&
    !nextPayoutDate &&
    !dueDate &&
    expectedAmount == null
  ) {
    return undefined;
  }

  return {
    currentCycle,
    currentWeek,
    totalWeeks,
    contributionAmount,
    potCollected,
    potTarget,
    nextPayoutDate,
    dueDate,
    expectedAmount,
  };
}

function readMembers(raw: UnknownRecord): GroupMember[] {
  if (!Array.isArray(raw.members)) {
    return [];
  }

  return raw.members
    .map((entry, index) => {
      const member = asRecord(entry);
      if (!member) {
        return null;
      }

      const user = asRecord(member.user);

      const id =
        readString(member.id) ??
        readString(member.membershipId) ??
        `member-${index}`;

      const name = readMemberName(member);

      const statusRaw = (
        readString(member.status) ??
        readString(member.membershipStatus) ??
        "JOINED"
      ).toUpperCase();

      const payoutTurn =
        readNumber(member.payoutTurn) ??
        readNumber(member.position) ??
        readNumber(member.turn);

      const contributionStatus =
        readString(member.contributionStatus) ??
        readString(member.paymentStatus) ??
        readString(member.weekStatus);

      const dueAmount =
        readMoneyFromApi(member.dueAmount) ??
        readMoneyFromApi(member.amountDue) ??
        readMoneyFromApi(member.remainingAmount);

      // Membership role only — never nested user.role (app/account role ≠ group role).
      const role =
        readString(member.role) ??
        readString(member.membershipRole) ??
        readString(member.userRole);

      const userId =
        readString(member.userId) ??
        readString(member.user_id) ??
        readString(user?.id);

      const email =
        readString(member.email) ??
        readString(member.userEmail) ??
        readString(user?.email);

      const isMe =
        readBoolean(member.isMe) ??
        readBoolean(member.isCurrentUser) ??
        readBoolean(member.isSelf) ??
        readBoolean(user?.isMe);

      const normalized: GroupMember = {
        id,
        name,
        status: statusRaw === "PENDING" ? "PENDING" : "JOINED",
      };

      if (payoutTurn != null && payoutTurn > 0) {
        normalized.payoutTurn = payoutTurn;
      }
      if (contributionStatus) {
        normalized.contributionStatus = contributionStatus.toUpperCase();
      }
      if (dueAmount != null) {
        normalized.dueAmount = dueAmount;
      }
      if (role) {
        normalized.role = role;
      }
      if (userId) {
        normalized.userId = userId;
      }
      if (email) {
        normalized.email = email;
      }
      if (isMe != null) {
        normalized.isMe = isMe;
      }

      return normalized;
    })
    .filter((member): member is GroupMember => member != null);
}

export type CurrentUserIdentity = {
  id?: string;
  email?: string;
};

function emailsMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Resolve which membership rows belong to the signed-in user.
 *
 * Live API (Jul 2026) sends members with `email` + `role` only — no userId/isMe.
 * Prefer email when any member has an email so we never miss the CONTRIBUTOR row.
 * Fall back to userId when emails are absent.
 */
export function findMyMembershipRows(
  members: GroupMember[],
  currentUser?: CurrentUserIdentity | null,
): GroupMember[] {
  if (!currentUser?.id && !currentUser?.email) {
    return [];
  }

  const membersHaveEmail = members.some((member) => Boolean(member.email));

  if (currentUser.email && membersHaveEmail) {
    const byEmail = members.filter((member) =>
      emailsMatch(currentUser.email, member.email),
    );
    if (byEmail.length > 0) {
      return byEmail;
    }
    // Emails exist on the roster but none match this user → not a member row.
    return [];
  }

  if (currentUser.id) {
    const byId = members.filter(
      (member) => member.userId && member.userId === currentUser.id,
    );
    if (byId.length > 0) {
      return byId;
    }
  }

  if (currentUser.email) {
    return members.filter((member) =>
      emailsMatch(currentUser.email, member.email),
    );
  }

  return [];
}

export function isMemberCurrentUser(
  member: GroupMember,
  currentUser?: CurrentUserIdentity | null,
): boolean {
  if (emailsMatch(currentUser?.email, member.email)) {
    return true;
  }

  if (currentUser?.id && member.userId) {
    return currentUser.id === member.userId;
  }

  return false;
}

/**
 * Authoritative admin check for Invite / Payout Order.
 * Uses only the caller's matched membership role — never details.isCreator alone,
 * never isMe, never device memory, never top-level flags.
 */
export function isGroupAdminForCurrentUser(
  details: Pick<GroupDetails, "members"> | null | undefined,
  currentUser?: CurrentUserIdentity | null,
): boolean {
  if (!details?.members?.length) {
    return false;
  }

  if (!currentUser?.email && !currentUser?.id) {
    return false;
  }

  // Live API identifies members by email — require email when roster has emails.
  const rosterHasEmail = details.members.some((member) =>
    Boolean(member.email),
  );
  if (rosterHasEmail && !currentUser.email) {
    return false;
  }

  const myRows = findMyMembershipRows(details.members, currentUser);
  if (myRows.length === 0) {
    return false;
  }

  return myRows.some((member) => isCreatorRole(member.role));
}

/**
 * Access decision while normalizing GET /groups/:id.
 * Deny by default. Never trust top-level isCreator / isAdmin / isOwner / isMe.
 */
export function resolveGroupDetailsIsCreator(
  _raw: UnknownRecord,
  members: GroupMember[],
  currentUser?: CurrentUserIdentity | null,
): boolean {
  return isGroupAdminForCurrentUser({ members }, currentUser);
}

export function normalizeGroupSummaryFromApi(raw: unknown): GroupSummary {
  const record = asRecord(raw) ?? {};
  const cycleDetails = readCycleDetails(record);
  const hasActiveCycle = readHasActiveCycle(record);
  const contributionAmount =
    readMoneyFromApi(record.contributionAmount) ?? cycleDetails?.contributionAmount;

  return {
    id: readString(record.id) ?? "",
    name: readString(record.name) ?? "",
    description: readString(record.description),
    inviteCode: readString(record.inviteCode),
    // List payloads lack members[]; badge hint only (myDetails.role).
    // Navigation must re-verify via GET /groups/:id membership role.
    isCreator: readListCreatorHint(record),
    contributionAmount,
    frequency: readFrequency(record),
    numberOfParticipants: readParticipantCount(record),
    joinedCount: readJoinedCount(record),
    myDetails: readMyDetails(record),
    cycleDetails,
    hasActiveCycle,
  };
}

export function normalizeGroupDetailsFromApi(
  raw: unknown,
  currentUser?: CurrentUserIdentity | null,
): GroupDetails {
  const record = asRecord(raw) ?? {};
  const members = readMembers(record);
  const numberOfParticipants = readParticipantCount(record);
  const joinedCount = readJoinedCount(record, members);
  const myDetails = mergeMyDetailsWithMemberStatus(
    readMyDetails(record),
    members,
    currentUser,
  );

  const isCreator = resolveGroupDetailsIsCreator(record, members, currentUser);

  const cycleDetails = readCycleDetails(record);
  const hasActiveCycle = readHasActiveCycle(record);
  const contributionAmount =
    readMoneyFromApi(record.contributionAmount) ?? cycleDetails?.contributionAmount;

  return {
    id: readString(record.id) ?? "",
    name: readString(record.name) ?? "",
    description: readString(record.description),
    inviteCode: readString(record.inviteCode) ?? "",
    numberOfParticipants,
    joinedCount,
    members,
    isCreator,
    contributionAmount,
    frequency: readFrequency(record),
    myDetails,
    cycleDetails,
    hasActiveCycle,
  };
}

export function isGroupCreator(group: GroupSummary): boolean {
  return group.isCreator === true;
}
