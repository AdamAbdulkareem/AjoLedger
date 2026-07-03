const DEFAULT_AVATAR = require("../../assets/home/avatar-default.png");

export const DEFAULT_AVATAR_URI = "asset:avatar-default";

export function resolveAvatarSource(avatarUri: string | null | undefined) {
  if (!avatarUri || avatarUri === DEFAULT_AVATAR_URI) {
    return DEFAULT_AVATAR;
  }
  return { uri: avatarUri };
}

export function isDefaultAvatar(avatarUri: string | null | undefined): boolean {
  return !avatarUri || avatarUri === DEFAULT_AVATAR_URI;
}

export function hasCustomAvatar(avatarUri: string | null | undefined): boolean {
  return !!avatarUri && avatarUri !== DEFAULT_AVATAR_URI;
}
