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
import { AppState, type AppStateStatus } from "react-native";

import { loginUser, registerUser } from "../api/auth";
import { ApiError } from "../api/client";
import {
  clearAccessPasscode,
  hasAccessPasscode,
  isValidAccessPasscode,
  saveAccessPasscode,
  verifyAccessPasscode,
} from "../lib/accessPasscodeStorage";
import {
  clearSessionStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "../lib/authStorage";
import { isMockAccessToken, shouldUseLiveRegisterLogin } from "../config/api";
import {
  INCORRECT_ACCESS_PASSCODE,
  type AuthStatus,
  type User,
} from "../models/auth";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<AuthStatus>;
  setupAccessPasscode: (passcode: string) => Promise<void>;
  verifyAccessPasscode: (passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSessionUser: (nextUser: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveStatus(
  token: string | null,
  accessPasscodeConfigured: boolean,
  accessPasscodeUnlocked: boolean,
): AuthStatus {
  if (!token) return "unauthenticated";
  if (!accessPasscodeConfigured) return "needsPasscodeSetup";
  if (!accessPasscodeUnlocked) return "needsPasscodeEntry";
  return "authenticated";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [accessPasscodeConfigured, setAccessPasscodeConfigured] =
    useState(false);
  const [accessPasscodeUnlocked, setAccessPasscodeUnlocked] = useState(false);

  const sessionRef = useRef({ accessToken, user, accessPasscodeConfigured });
  sessionRef.current = { accessToken, user, accessPasscodeConfigured };

  const lockAccess = useCallback(() => {
    const {
      accessToken: token,
      user: currentUser,
      accessPasscodeConfigured: configured,
    } = sessionRef.current;

    if (!token || !currentUser || !configured) return;

    setAccessPasscodeUnlocked(false);
    setStatus(resolveStatus(token, configured, false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [token, storedUser] = await Promise.all([
          getAccessToken(),
          getStoredUser(),
        ]);

        if (shouldUseLiveRegisterLogin() && isMockAccessToken(token)) {
          if (storedUser) await clearAccessPasscode(storedUser.id);
          await clearSessionStorage();
          if (cancelled) return;
          setAccessTokenState(null);
          setUser(null);
          setAccessPasscodeConfigured(false);
          setAccessPasscodeUnlocked(false);
          setStatus("unauthenticated");
          return;
        }

        const passcodeConfigured = storedUser
          ? await hasAccessPasscode(storedUser.id)
          : false;

        if (cancelled) return;

        setAccessTokenState(token);
        setUser(storedUser);
        setAccessPasscodeConfigured(passcodeConfigured);
        setAccessPasscodeUnlocked(false);
        setStatus(resolveStatus(token, passcodeConfigured, false));
      } catch {
        if (cancelled) return;

        setAccessTokenState(null);
        setUser(null);
        setAccessPasscodeConfigured(false);
        setAccessPasscodeUnlocked(false);
        setStatus(resolveStatus(null, false, false));
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let appWasBackgrounded = false;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background") {
        appWasBackgrounded = true;
        return;
      }

      if (nextState !== "active" || !appWasBackgrounded) return;

      appWasBackgrounded = false;

      const {
        accessToken: token,
        user: currentUser,
        accessPasscodeConfigured: configured,
      } = sessionRef.current;

      if (token && currentUser && configured) {
        lockAccess();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [lockAccess]);

  const persistSession = useCallback(async (token: string, nextUser: User) => {
    await Promise.all([setAccessToken(token), setStoredUser(nextUser)]);
    setAccessTokenState(token);
    setUser(nextUser);
    setAccessPasscodeUnlocked(false);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await registerUser({ email, password });
      if (!data) throw new ApiError("Registration failed. Please try again.");

      await persistSession(data.accessToken, data.user);
      setAccessPasscodeConfigured(false);
      setStatus("needsPasscodeSetup");
    },
    [persistSession],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthStatus> => {
      const { data } = await loginUser({ email, password });
      if (!data) throw new ApiError("Login failed. Please try again.");

      await persistSession(data.accessToken, data.user);
      const passcodeConfigured = await hasAccessPasscode(data.user.id);
      setAccessPasscodeConfigured(passcodeConfigured);
      const nextStatus = resolveStatus(
        data.accessToken,
        passcodeConfigured,
        false,
      );
      setStatus(nextStatus);
      return nextStatus;
    },
    [persistSession],
  );

  const setupAccessPasscode = useCallback(
    async (passcode: string) => {
      if (!user) throw new ApiError("You are not signed in.");

      if (!isValidAccessPasscode(passcode)) {
        throw new ApiError("Access passcode must be 6 digits.");
      }

      await saveAccessPasscode(user.id, passcode);
      setAccessPasscodeConfigured(true);
      setAccessPasscodeUnlocked(true);
      setStatus("authenticated");
    },
    [user],
  );

  const verifyAccessPasscodeEntry = useCallback(
    async (passcode: string) => {
      if (!user) throw new ApiError("You are not signed in.");

      if (!isValidAccessPasscode(passcode)) {
        throw new ApiError("Access passcode must be 6 digits.");
      }

      const valid = await verifyAccessPasscode(user.id, passcode);
      if (!valid) {
        throw new ApiError(INCORRECT_ACCESS_PASSCODE);
      }

      setAccessPasscodeUnlocked(true);
      setStatus("authenticated");
    },
    [user],
  );

  const logout = useCallback(async () => {
    if (user) await clearAccessPasscode(user.id);
    await clearSessionStorage();
    setAccessTokenState(null);
    setUser(null);
    setAccessPasscodeConfigured(false);
    setAccessPasscodeUnlocked(false);
    setStatus("unauthenticated");
  }, [user]);

  const updateSessionUser = useCallback(async (nextUser: User) => {
    await setStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      register,
      login,
      setupAccessPasscode,
      verifyAccessPasscode: verifyAccessPasscodeEntry,
      logout,
      updateSessionUser,
    }),
    [
      status,
      user,
      accessToken,
      register,
      login,
      setupAccessPasscode,
      verifyAccessPasscodeEntry,
      logout,
      updateSessionUser,
    ],
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
