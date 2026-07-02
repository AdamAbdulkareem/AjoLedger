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
  | "needsPinSetup"
  | "needsPinEntry"
  | "authenticated";
