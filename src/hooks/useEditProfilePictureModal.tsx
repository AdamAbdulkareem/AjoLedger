import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { EditProfilePictureModal } from "../components/profile/EditProfilePictureModal";
import { useProfile } from "../context/ProfileProvider";
import { DEFAULT_AVATAR_URI, hasCustomAvatar } from "../lib/avatarSource";
import { pickProfileImage } from "../lib/pickProfileImage";

type UseEditProfilePictureModalOptions = {
  /** When true, avatar changes stay local until commitPendingAvatar is called. */
  deferChanges?: boolean;
};

export function useEditProfilePictureModal(
  options: UseEditProfilePictureModalOptions = {},
) {
  const { deferChanges = false } = options;
  const { t } = useTranslation();
  const { profile, setAvatarUri, deleteAvatar, saving } = useProfile();
  const [visible, setVisible] = useState(false);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(
    profile?.avatarUri ?? null,
  );

  useEffect(() => {
    if (!deferChanges) return;
    setPendingAvatarUri(profile?.avatarUri ?? null);
  }, [deferChanges, profile?.avatarUri]);

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

  const applyAvatarChange = useCallback(
    async (nextUri: string | null, mode: "set" | "delete" = "set") => {
      if (deferChanges) {
        setPendingAvatarUri(nextUri);
        close();
        return;
      }

      if (mode === "delete") {
        await runAvatarAction(() => deleteAvatar());
        return;
      }

      await runAvatarAction(() => setAvatarUri(nextUri));
    },
    [close, deferChanges, deleteAvatar, runAvatarAction, setAvatarUri],
  );

  const handleChooseAvatar = () => {
    void applyAvatarChange(DEFAULT_AVATAR_URI);
  };

  const handleTakePhoto = () => {
    void (async () => {
      const uri = await pickProfileImage({ t, source: "camera" });
      if (!uri) return;
      await applyAvatarChange(uri);
    })();
  };

  const handleChoosePhoto = () => {
    void (async () => {
      const uri = await pickProfileImage({ t, source: "library" });
      if (!uri) return;
      await applyAvatarChange(uri);
    })();
  };

  const handleDeletePhoto = () => {
    if (deferChanges) {
      void applyAvatarChange(DEFAULT_AVATAR_URI);
      return;
    }

    void applyAvatarChange(DEFAULT_AVATAR_URI, "delete");
  };

  const commitPendingAvatar = useCallback(async () => {
    if (!deferChanges) return;

    const savedUri = profile?.avatarUri ?? null;
    if (pendingAvatarUri === savedUri) return;

    if (!hasCustomAvatar(pendingAvatarUri)) {
      await deleteAvatar();
      return;
    }

    await setAvatarUri(pendingAvatarUri);
  }, [
    deferChanges,
    deleteAvatar,
    pendingAvatarUri,
    profile?.avatarUri,
    setAvatarUri,
  ]);

  const discardPendingAvatar = useCallback(() => {
    if (!deferChanges) return;
    setPendingAvatarUri(profile?.avatarUri ?? null);
  }, [deferChanges, profile?.avatarUri]);

  const modal = (
    <EditProfilePictureModal
      visible={visible}
      hasCustomPhoto={hasCustomAvatar(
        deferChanges ? pendingAvatarUri : profile?.avatarUri,
      )}
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
    avatarUri: deferChanges
      ? pendingAvatarUri
      : (profile?.avatarUri ?? null),
    commitPendingAvatar,
    discardPendingAvatar,
  };
}
