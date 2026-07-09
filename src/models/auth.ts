export type User = {
  id: string;
  email: string;
};

export type AuthData = {
  accessToken: string;
  user: User;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type AuthStatus =
  | "booting"
  | "unauthenticated"
  | "needsPasscodeSetup"
  | "needsPasscodeEntry"
  | "authenticated";

/** ApiError.message sentinel for failed local access-passcode verification. */
export const INCORRECT_ACCESS_PASSCODE = "INCORRECT_ACCESS_PASSCODE";

/** ApiError.message sentinel when passcode entry is temporarily locked. */
export const PASSCODE_LOCKED_OUT = "PASSCODE_LOCKED_OUT";

/** ApiError.message sentinel when biometric hardware auth is cancelled. */
export const BIOMETRIC_CANCELLED = "BIOMETRIC_CANCELLED";

/** ApiError.message sentinel when biometrics are not enrolled on device. */
export const BIOMETRIC_NOT_ENROLLED = "BIOMETRIC_NOT_ENROLLED";
