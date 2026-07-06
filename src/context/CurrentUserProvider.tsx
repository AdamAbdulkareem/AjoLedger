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

import { getCurrentUser } from "../api/banks";
import { ApiError } from "../api/client";
import { mockGetPayoutAccountStatus } from "../api/mockPayoutAccount";
import { mockGetUserProfile } from "../api/mockProfile";
import { USE_MOCK_AUTH } from "../config/api";
import { deriveDisplayName } from "../lib/greeting";
import type { UserWithPayout } from "../models/bank";
import { useAuth } from "./AuthProvider";

type CurrentUserContextValue = {
  currentUser: UserWithPayout | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  displayName: string;
  email: string;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

async function fetchCurrentUser(
  accessToken: string,
  userId: string,
  email: string,
): Promise<UserWithPayout> {
  if (USE_MOCK_AUTH) {
    const [profile, payoutStatus] = await Promise.all([
      mockGetUserProfile(userId, email),
      mockGetPayoutAccountStatus(userId),
    ]);

    const account = payoutStatus.data?.account;

    return {
      id: userId,
      name: profile.fullName,
      email,
      payoutBankCode: account?.bankCode ?? null,
      payoutAccountNumber: account?.accountNumber ?? null,
      payoutAccountName: account?.accountName ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return getCurrentUser(accessToken);
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, status, updateSessionUser } = useAuth();
  const requestIdRef = useRef(0);

  const [currentUser, setCurrentUser] = useState<UserWithPayout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!accessToken || !user || status !== "authenticated") {
      if (requestId !== requestIdRef.current) return;
      setCurrentUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextUser = await fetchCurrentUser(
        accessToken,
        user.id,
        user.email,
      );
      if (requestId !== requestIdRef.current) return;

      setCurrentUser(nextUser);

      if (nextUser.email !== user.email) {
        await updateSessionUser({ ...user, email: nextUser.email });
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setCurrentUser(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [accessToken, user, status, updateSessionUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const displayName = useMemo(() => {
    const name = currentUser?.name?.trim();
    if (name) return name;

    const email = currentUser?.email ?? user?.email;
    return deriveDisplayName(email) ?? "";
  }, [currentUser, user?.email]);

  const email = currentUser?.email ?? user?.email ?? "";

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      currentUser,
      loading,
      error,
      refresh,
      displayName,
      email,
    }),
    [currentUser, loading, error, refresh, displayName, email],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return context;
}
