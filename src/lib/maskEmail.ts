export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  const visible = local.slice(0, Math.min(3, local.length));
  const hiddenLength = Math.max(local.length - visible.length, 4);

  return `${visible}${"*".repeat(hiddenLength)}${domain}`;
}
