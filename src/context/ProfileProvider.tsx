import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  deleteUserAvatar,
  getUserProfile,
  updateUserAvatar,
  updateUserProfile,
} from "../api/profile";
import { ApiError } from "../api/client";
import { useAuth } from "./AuthProvider";
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
  const requestIdRef = useRef(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingUpdateSuccess, setPendingUpdateSuccess] = useState(false);

  const refreshProfile = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!accessToken || !user || status !== "authenticated") {
      if (requestId !== requestIdRef.current) return;
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserProfile(accessToken, user.id, user.email);
      if (requestId !== requestIdRef.current) return;
      setProfile(data);
    } catch {
      if (requestId !== requestIdRef.current) return;
      // Keep the last known profile on transient fetch failures.
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [accessToken, user, status]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

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

        setPendingUpdateSuccess(true);
      } finally {
        setSaving(false);
      }
    },
    [accessToken, user, updateSessionUser],
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
      loading,
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
      loading,
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
  const { profile } = useProfile();
  return profile?.fullName?.trim() || fallback;
}
