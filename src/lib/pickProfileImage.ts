import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";
import type { TFunction } from "i18next";

type PickProfileImageOptions = {
  t: TFunction;
  source: "camera" | "library";
};

export async function pickProfileImage({
  t,
  source,
}: PickProfileImageOptions): Promise<string | null> {
  if (Platform.OS === "web") {
    Alert.alert(t("home.comingSoonTitle"), t("profile.editPhoto.webUnavailable"));
    return null;
  }

  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      t("profile.editPhoto.permissionTitle"),
      t("profile.editPhoto.permissionBody"),
    );
    return null;
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/** Uses the bundled default avatar as the user's profile photo. */
export { DEFAULT_AVATAR_URI } from "./avatarSource";
