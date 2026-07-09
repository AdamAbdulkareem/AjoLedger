import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { ApiError } from "../api/client";
import { deriveDisplayName } from "../lib/greeting";
import { invalidateUserQueries } from "../lib/invalidateQueries";
import type { UserWithPayout } from "../models/bank";
import { useAuth } from "./AuthProvider";
import { useCurrentUserQuery } from "../hooks/queries/useCurrentUserQuery";

type CurrentUserContextValue = {
  currentUser: UserWithPayout | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  displayName: string;
  email: string;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

function resolveQueryError(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, status, updateSessionUser } = useAuth();
  const isAuthenticated = status === "authenticated";

  const {
    data: currentUser = null,
    isLoading,
    error: queryError,
  } = useCurrentUserQuery(accessToken, isAuthenticated);

  useEffect(() => {
    if (!currentUser || !user) return;
    if (currentUser.email === user.email) return;

    void updateSessionUser({ ...user, email: currentUser.email });
  }, [currentUser, user, updateSessionUser]);

  const refresh = useCallback(async () => {
    await invalidateUserQueries(accessToken);
  }, [accessToken]);

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
      loading: isAuthenticated && isLoading,
      error: resolveQueryError(queryError),
      refresh,
      displayName,
      email,
    }),
    [
      currentUser,
      isAuthenticated,
      isLoading,
      queryError,
      refresh,
      displayName,
      email,
    ],
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
