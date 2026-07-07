import type {
  GroupCycleDetails,
  GroupDetails,
  GroupMember,
  GroupMyDetails,
  GroupSummary,
} from "../models/group";
import { deriveDisplayName } from "./greeting";

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

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function isCreatorRole(role: string | undefined): boolean {
  if (!role) {
    return false;
  }
  return CREATOR_ROLES.has(role.trim().toUpperCase());
}

function readCreatorFlag(raw: UnknownRecord): boolean {
  const direct =
    readBoolean(raw.isCreator) ??
    readBoolean(raw.isAdmin) ??
    readBoolean(raw.isCoordinator) ??
    readBoolean(raw.isOwner);

  if (direct != null) {
    return direct;
  }

  const role =
    readString(raw.role) ??
    readString(raw.membershipRole) ??
    readString(raw.userRole);

  if (isCreatorRole(role)) {
    return true;
  }

  const myDetails = asRecord(raw.myDetails);
  if (myDetails && isCreatorRole(readString(myDetails.role))) {
    return true;
  }

  return false;
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

function readVirtualAccountDisplayName(value: string | undefined): string | undefined {
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
  const status = readString(myDetails.status);

  if (
    position == null &&
    !virtualAccountNumber &&
    !virtualBankName &&
    !virtualAccountName &&
    !status
  ) {
    return undefined;
  }

  return {
    position: position ?? null,
    status,
    virtualAccountNumber,
    virtualBankName,
    virtualAccountName,
  };
}

function readCycleDetails(raw: UnknownRecord): GroupCycleDetails | undefined {
  const cycleDetails = asRecord(raw.cycleDetails);
  const activeCycle = asRecord(raw.activeCycle);
  const source = cycleDetails ?? activeCycle;

  if (!source) {
    return undefined;
  }

  const currentCycle = readNumber(source.currentCycle);
  const contributionAmount = readNumber(source.contributionAmount);
  const potCollected = readNumber(source.potCollected);
  const potTarget = readNumber(source.potTarget);
  const nextPayoutDate = readString(source.nextPayoutDate);

  if (
    currentCycle == null &&
    contributionAmount == null &&
    potCollected == null &&
    potTarget == null &&
    !nextPayoutDate
  ) {
    return undefined;
  }

  return {
    currentCycle,
    contributionAmount,
    potCollected,
    potTarget,
    nextPayoutDate,
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

      return {
        id,
        name,
        status: statusRaw === "PENDING" ? "PENDING" : "JOINED",
      } satisfies GroupMember;
    })
    .filter((member): member is GroupMember => member != null);
}

export function normalizeGroupSummaryFromApi(raw: unknown): GroupSummary {
  const record = asRecord(raw) ?? {};
  const cycleDetails = readCycleDetails(record);
  const contributionAmount =
    readNumber(record.contributionAmount) ?? cycleDetails?.contributionAmount;

  return {
    id: readString(record.id) ?? "",
    name: readString(record.name) ?? "",
    description: readString(record.description),
    inviteCode: readString(record.inviteCode),
    isCreator: readCreatorFlag(record),
    contributionAmount,
    frequency: readFrequency(record),
    numberOfParticipants: readParticipantCount(record),
    joinedCount: readJoinedCount(record),
    myDetails: readMyDetails(record),
    cycleDetails,
  };
}

export function normalizeGroupDetailsFromApi(raw: unknown): GroupDetails {
  const record = asRecord(raw) ?? {};
  const members = readMembers(record);
  const numberOfParticipants = readParticipantCount(record);
  const joinedCount = readJoinedCount(record, members);

  let isCreator = readCreatorFlag(record);

  if (!isCreator && Array.isArray(record.members)) {
    isCreator = record.members.some((entry) => {
      const member = asRecord(entry);
      if (!member) {
        return false;
      }

      const isCurrentUser =
        readBoolean(member.isMe) ??
        readBoolean(member.isCurrentUser) ??
        readBoolean(member.isSelf);

      return isCurrentUser === true && isCreatorRole(readString(member.role));
    });
  }

  const cycleDetails = readCycleDetails(record);
  const contributionAmount =
    readNumber(record.contributionAmount) ?? cycleDetails?.contributionAmount;

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
    myDetails: readMyDetails(record),
    cycleDetails,
  };
}

export function isGroupCreator(group: GroupSummary): boolean {
  return group.isCreator === true;
}
