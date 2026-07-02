export function getGreetingKey(
  date = new Date(),
): "goodMorning" | "goodAfternoon" | "goodEvening" {
  const hour = date.getHours();
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
}

export function deriveDisplayName(email: string | undefined): string | undefined {
  if (!email) return undefined;
  const local = email.split("@")[0]?.trim();
  if (!local) return undefined;
  return local.charAt(0).toUpperCase() + local.slice(1);
}
