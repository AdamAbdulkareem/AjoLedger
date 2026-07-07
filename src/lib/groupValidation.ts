import type { ContributionFrequency } from "../models/group";

const INVITE_CODE_PATTERN = /^AJO-[A-Z0-9]{6}$/;

export function normalizeInviteCode(raw: string): string {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (trimmed.startsWith("AJO-")) return trimmed;
  if (/^[A-Z0-9]{6}$/.test(trimmed)) return `AJO-${trimmed}`;
  return trimmed;
}

export function validateInviteCode(
  raw: string,
  messages: { required: string; invalid: string },
): string | null {
  const normalized = normalizeInviteCode(raw);
  if (!normalized) return messages.required;
  if (!INVITE_CODE_PATTERN.test(normalized)) return messages.invalid;
  return null;
}

export type CreateGroupFormValues = {
  name: string;
  description: string;
  frequency: ContributionFrequency;
  contributionAmount: string;
  numberOfParticipants: string;
};

export type CreateGroupFieldErrors = Partial<
  Record<
    keyof CreateGroupFormValues | "form",
    string
  >
>;

export function parsePositiveInteger(value: string): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return null;

  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateCreateGroupForm(
  values: CreateGroupFormValues,
  messages: {
    nameRequired: string;
    nameLength: string;
    descriptionLength: string;
    amountRequired: string;
    amountMinimum: string;
    participantsRequired: string;
    participantsMinimum: string;
  },
): CreateGroupFieldErrors | null {
  const errors: CreateGroupFieldErrors = {};
  const trimmedName = values.name.trim();
  const trimmedDescription = values.description.trim();

  if (!trimmedName) {
    errors.name = messages.nameRequired;
  } else if (trimmedName.length < 3 || trimmedName.length > 100) {
    errors.name = messages.nameLength;
  }

  if (trimmedDescription.length > 500) {
    errors.description = messages.descriptionLength;
  }

  const amount = parsePositiveInteger(values.contributionAmount);
  if (amount === null) {
    errors.contributionAmount = messages.amountRequired;
  } else if (amount < 500) {
    errors.contributionAmount = messages.amountMinimum;
  }

  const participants = parsePositiveInteger(values.numberOfParticipants);
  if (participants === null) {
    errors.numberOfParticipants = messages.participantsRequired;
  } else if (participants < 2) {
    errors.numberOfParticipants = messages.participantsMinimum;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
