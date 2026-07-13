/** Splits a display name into first / last for PATCH /users/me. */
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

export function joinFullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = "",
): string {
  const combined = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return combined || fallback;
}
