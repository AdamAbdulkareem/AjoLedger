import type { GroupMember } from "../models/group";

export type GroupInviteMember = {
  id: string;
  name: string;
};

export function isJoinedMember(member: GroupMember): boolean {
  return String(member.status).toUpperCase() === "JOINED";
}

export function getJoinedMembers(members: GroupMember[]): GroupMember[] {
  return members.filter(isJoinedMember);
}

export function mapJoinedMembersForInvite(
  members: GroupMember[],
): GroupInviteMember[] {
  return getJoinedMembers(members).map((member) => ({
    id: member.id,
    name: member.name,
  }));
}

export function countJoinedMembers(members: GroupMember[]): number {
  return getJoinedMembers(members).length;
}

/** @deprecated Use mapJoinedMembersForInvite */
export function mapGroupMembersForInvite(
  members: GroupMember[],
): GroupInviteMember[] {
  return mapJoinedMembersForInvite(members);
}
