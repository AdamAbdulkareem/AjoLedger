export const DELETE_ACCOUNT_REASONS = [
  "notUsingApp",
  "privacyConcerns",
  "doesntMeetNeeds",
  "technicalIssues",
  "tooManyAccounts",
  "switchingService",
  "other",
] as const;

export type DeleteAccountReasonId = (typeof DELETE_ACCOUNT_REASONS)[number];

export function reasonIdToApiValue(
  reasonId: DeleteAccountReasonId,
  t: (key: string) => string,
): string {
  return t(`profile.deleteAccount.reasons.${reasonId}`);
}
