export type UserProfile = {
  fullName: string;
  phoneNumber: string;
  /** Local file URI or remote URL; null uses the default avatar asset. */
  avatarUri: string | null;
};

export type UpdateProfilePayload = {
  fullName: string;
  phoneNumber: string;
};

export type UpdateProfileResult = {
  profile: UserProfile;
  email: string;
};
