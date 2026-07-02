const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  const trimmed = password.trim();
  return trimmed.length >= 8;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
