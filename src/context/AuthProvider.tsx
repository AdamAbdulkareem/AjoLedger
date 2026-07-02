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
  loginUser,
  registerUser,
  setupTransactionPin,
  verifyTransactionPin,
} from "../api/auth";
import { ApiError } from "../api/client";
import {
  clearSessionStorage,
  getAccessToken,
  getPinConfigured,
  getStoredUser,
  setAccessToken,
  setPinConfigured,
  setStoredUser,
} from "../lib/authStorage";
import type { AuthStatus, User } from "../models/auth";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<AuthStatus>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveStatus(
  token: string | null,
  pinConfigured: boolean,
  pinUnlocked: boolean,
): AuthStatus {
  if (!token) return "unauthenticated";
  if (!pinConfigured) return "needsPinSetup";
  if (!pinUnlocked) return "needsPinEntry";
  return "authenticated";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [token, storedUser] = await Promise.all([
        getAccessToken(),
        getStoredUser(),
      ]);
      const pinConfigured = storedUser
        ? await getPinConfigured(storedUser.id)
        : false;

      if (cancelled) return;

      setAccessTokenState(token);
      setUser(storedUser);
      setPinUnlocked(false);
      setStatus(resolveStatus(token, pinConfigured, false));
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (token: string, nextUser: User) => {
    await Promise.all([setAccessToken(token), setStoredUser(nextUser)]);
    setAccessTokenState(token);
    setUser(nextUser);
    setPinUnlocked(false);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await registerUser({ email, password });
      if (!data) throw new ApiError("Registration failed. Please try again.");

      await persistSession(data.accessToken, data.user);
      await setPinConfigured(data.user.id, false);
      setStatus("needsPinSetup");
    },
    [persistSession],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthStatus> => {
      const { data } = await loginUser({ email, password });
      if (!data) throw new ApiError("Login failed. Please try again.");

      await persistSession(data.accessToken, data.user);
      const pinConfigured = await getPinConfigured(data.user.id);
      const nextStatus = resolveStatus(data.accessToken, pinConfigured, false);
      setStatus(nextStatus);
      return nextStatus;
    },
    [persistSession],
  );

  const setupPin = useCallback(
    async (pin: string) => {
      if (!accessToken) throw new ApiError("You are not signed in.");

      await setupTransactionPin(accessToken, pin);
      if (!user) throw new ApiError("You are not signed in.");
      await setPinConfigured(user.id, true);
      setPinUnlocked(true);
      setStatus("authenticated");
    },
    [accessToken, user],
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!accessToken) throw new ApiError("You are not signed in.");

      await verifyTransactionPin(accessToken, pin);
      setPinUnlocked(true);
      setStatus("authenticated");
    },
    [accessToken],
  );

  const logout = useCallback(async () => {
    await clearSessionStorage();
    setAccessTokenState(null);
    setUser(null);
    setPinUnlocked(false);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      register,
      login,
      setupPin,
      verifyPin,
      logout,
    }),
    [status, user, accessToken, register, login, setupPin, verifyPin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useAuthStatus(): AuthStatus {
  return useAuth().status;
}
