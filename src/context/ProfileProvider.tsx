import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  deleteUserAvatar,
  updateUserAvatar,
  updateUserProfile,
  userProfileFromMe,
} from "../api/profile";
import { mockGetUserProfile } from "../api/mockProfile";
import { ApiError } from "../api/client";
import { USE_MOCK_AUTH } from "../config/api";
import { useAuth } from "./AuthProvider";
import { useCurrentUser } from "./CurrentUserProvider";
import type { UpdateProfilePayload, UserProfile } from "../models/profile";

type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  pendingUpdateSuccess: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  setAvatarUri: (avatarUri: string | null) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  consumePendingUpdateSuccess: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, status, updateSessionUser } = useAuth();
  const { currentUser, loading: userLoading, refresh: refreshCurrentUser } =
    useCurrentUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingUpdateSuccess, setPendingUpdateSuccess] = useState(false);

  const refreshProfile = useCallback(async () => {
    await refreshCurrentUser();
  }, [refreshCurrentUser]);

  useEffect(() => {
    if (status !== "authenticated" || !currentUser) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      if (USE_MOCK_AUTH) {
        const mockProfile = await mockGetUserProfile(
          currentUser.id,
          currentUser.email,
        );
        if (!cancelled) setProfile(mockProfile);
        return;
      }

      if (!cancelled) {
        setProfile((prev) => userProfileFromMe(currentUser, prev ?? undefined));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, status]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      if (!accessToken || !user) {
        throw new ApiError("You are not signed in.");
      }

      setSaving(true);
      try {
        const result = await updateUserProfile(
          accessToken,
          user.id,
          user.email,
          payload,
        );
        setProfile(result.profile);

        if (result.email !== user.email) {
          await updateSessionUser({ ...user, email: result.email });
        }

        await refreshCurrentUser();
        setPendingUpdateSuccess(true);
      } finally {
        setSaving(false);
      }
    },
    [accessToken, user, updateSessionUser, refreshCurrentUser],
  );

  const setAvatarUri = useCallback(
    async (avatarUri: string | null) => {
      if (!accessToken || !user) {
        throw new ApiError("You are not signed in.");
      }

      setSaving(true);
      try {
        const nextProfile = await updateUserAvatar(
          accessToken,
          user.id,
          user.email,
          avatarUri,
        );
        setProfile(nextProfile);
      } finally {
        setSaving(false);
      }
    },
    [accessToken, user],
  );

  const deleteAvatar = useCallback(async () => {
    if (!accessToken || !user) {
      throw new ApiError("You are not signed in.");
    }

    setSaving(true);
    try {
      const nextProfile = await deleteUserAvatar(
        accessToken,
        user.id,
        user.email,
      );
      setProfile(nextProfile);
    } finally {
      setSaving(false);
    }
  }, [accessToken, user]);

  const consumePendingUpdateSuccess = useCallback(() => {
    setPendingUpdateSuccess(false);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: userLoading,
      saving,
      pendingUpdateSuccess,
      refreshProfile,
      updateProfile,
      setAvatarUri,
      deleteAvatar,
      consumePendingUpdateSuccess,
    }),
    [
      profile,
      userLoading,
      saving,
      pendingUpdateSuccess,
      refreshProfile,
      updateProfile,
      setAvatarUri,
      deleteAvatar,
      consumePendingUpdateSuccess,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}

export function useProfileDisplayName(fallback: string): string {
  const { displayName } = useCurrentUser();
  return displayName || fallback;
}
