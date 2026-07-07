const JOIN_BASE_URL = "https://ajoledger.app/join";

export function buildJoinUrl(inviteCode: string): string {
  const suffix = inviteCode.replace(/^AJO-/i, "");
  return `${JOIN_BASE_URL}/${suffix}`;
}

export function buildShareMessage(groupName: string, inviteCode: string): string {
  const joinUrl = buildJoinUrl(inviteCode);
  return `Join ${groupName} on AjoLedger!\n\nInvite code: ${inviteCode}\n${joinUrl}`;
}
