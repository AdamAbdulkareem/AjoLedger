import type { ImageStyle, StyleProp } from "react-native";
import { Image } from "expo-image";

import { resolveAvatarSource } from "../lib/avatarSource";

type CachedAvatarProps = {
  avatarUri?: string | null;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function CachedAvatar({
  avatarUri,
  style,
  accessibilityLabel,
}: CachedAvatarProps) {
  return (
    <Image
      source={resolveAvatarSource(avatarUri)}
      style={style}
      accessibilityLabel={accessibilityLabel}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
    />
  );
}
