import { isValidEmail } from "./authValidation";

const PHONE_PATTERN = /^0\d{10}$/;

export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return true;
  return PHONE_PATTERN.test(normalized);
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 11);
}

export function validateProfileForm(input: {
  fullName: string;
  email: string;
  phoneNumber: string;
}): {
  valid: boolean;
  fullNameError?: "required";
  emailError?: "invalid";
  phoneError?: "invalid";
} {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);

  let valid = true;
  const errors: {
    fullNameError?: "required";
    emailError?: "invalid";
    phoneError?: "invalid";
  } = {};

  if (!fullName) {
    errors.fullNameError = "required";
    valid = false;
  }

  if (!isValidEmail(email)) {
    errors.emailError = "invalid";
    valid = false;
  }

  if (phoneNumber && !PHONE_PATTERN.test(phoneNumber)) {
    errors.phoneError = "invalid";
    valid = false;
  }

  return { valid, ...errors };
}
