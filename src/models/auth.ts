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
