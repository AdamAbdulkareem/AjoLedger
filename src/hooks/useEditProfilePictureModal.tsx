import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { EditProfilePictureModal } from "../components/profile/EditProfilePictureModal";
import { useProfile } from "../context/ProfileProvider";
import { DEFAULT_AVATAR_URI, hasCustomAvatar } from "../lib/avatarSource";
import { pickProfileImage } from "../lib/pickProfileImage";

export function useEditProfilePictureModal() {
  const { t } = useTranslation();
  const { profile, setAvatarUri, deleteAvatar, saving } = useProfile();
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const runAvatarAction = useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
        close();
      } catch {
        Alert.alert(t("home.errors.generic"), t("profile.editPhoto.updateFailed"));
      }
    },
    [close, t],
  );

  const handleChooseAvatar = () => {
    void runAvatarAction(() => setAvatarUri(DEFAULT_AVATAR_URI));
  };

  const handleTakePhoto = () => {
    void (async () => {
      const uri = await pickProfileImage({ t, source: "camera" });
      if (!uri) return;
      await runAvatarAction(() => setAvatarUri(uri));
    })();
  };

  const handleChoosePhoto = () => {
    void (async () => {
      const uri = await pickProfileImage({ t, source: "library" });
      if (!uri) return;
      await runAvatarAction(() => setAvatarUri(uri));
    })();
  };

  const handleDeletePhoto = () => {
    void runAvatarAction(() => deleteAvatar());
  };

  const modal = (
    <EditProfilePictureModal
      visible={visible}
      hasCustomPhoto={hasCustomAvatar(profile?.avatarUri)}
      onClose={close}
      onChooseAvatar={handleChooseAvatar}
      onTakePhoto={handleTakePhoto}
      onChoosePhoto={handleChoosePhoto}
      onDeletePhoto={handleDeletePhoto}
    />
  );

  return {
    open,
    close,
    modal,
    saving,
    avatarUri: profile?.avatarUri ?? null,
  };
}
