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
import { clearBanksCache } from "../api/banks";
import { ApiError } from "../api/client";
import {
  clearAccessPasscode,
  hasAccessPasscode,
  isValidAccessPasscode,
  saveAccessPasscode,
  verifyAccessPasscode,
} from "../lib/accessPasscodeStorage";
import { promptBiometricAuth } from "../lib/biometricAuth";
import {
  clearBiometricsEnabled,
  isBiometricsEnabled,
} from "../lib/biometricStorage";
import {
  clearSessionStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "../lib/authStorage";
import { setUnauthorizedHandler } from "../lib/authSessionHandler";
import {
  clearPasscodeLockout,
  getPasscodeLockoutStatus,
  recordPasscodeFailure,
} from "../lib/passcodeLockout";
import { clearRememberedCreatorGroups } from "../lib/creatorGroupsStorage";
import { clearQueryCache } from "../lib/queryClient";
import { setObservabilityUser } from "../lib/observability";
import { isLegacyMockAccessToken } from "../config/api";
import {
  BIOMETRIC_CANCELLED,
  BIOMETRIC_NOT_ENROLLED,
  INCORRECT_ACCESS_PASSCODE,
  PASSCODE_LOCKED_OUT,
  type AuthStatus,
  type User,
} from "../models/auth";

export type BiometricUnlockOptions = {
  promptMessage: string;
  /** When true, user/system cancel does not throw (used for auto-prompt on screen focus). */
  silentFailure?: boolean;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accessToken: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<AuthStatus>;
  setupAccessPasscode: (passcode: string) => Promise<void>;
  verifyAccessPasscode: (passcode: string) => Promise<void>;
  unlockWithBiometrics: (options: BiometricUnlockOptions) => Promise<void>;
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
    setObservabilityUser(user);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [token, storedUser] = await Promise.all([
          getAccessToken(),
          getStoredUser(),
        ]);

        if (isLegacyMockAccessToken(token)) {
          if (storedUser) {
            await Promise.all([
              clearAccessPasscode(storedUser.id),
              clearPasscodeLockout(storedUser.id),
            ]);
          }
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

        // Drop legacy device-global creator IDs that leaked across accounts.
        await clearRememberedCreatorGroups(storedUser?.id);

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
    // Drop any previous account's cached group details / isCreator decisions.
    clearQueryCache();
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
      await clearPasscodeLockout(user.id);
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

      const lockout = await getPasscodeLockoutStatus(user.id);
      if (lockout.locked) {
        throw new ApiError(PASSCODE_LOCKED_OUT, undefined, {
          remainingSeconds: lockout.remainingSeconds,
        });
      }

      const valid = await verifyAccessPasscode(user.id, passcode);
      if (!valid) {
        const nextLockout = await recordPasscodeFailure(user.id);
        if (nextLockout.locked) {
          throw new ApiError(PASSCODE_LOCKED_OUT, undefined, {
            remainingSeconds: nextLockout.remainingSeconds,
          });
        }
        throw new ApiError(INCORRECT_ACCESS_PASSCODE);
      }

      await clearPasscodeLockout(user.id);
      setAccessPasscodeUnlocked(true);
      setStatus("authenticated");
    },
    [user],
  );

  const unlockWithBiometrics = useCallback(
    async ({ promptMessage, silentFailure = false }: BiometricUnlockOptions) => {
      if (!user) throw new ApiError("You are not signed in.");

      const enabled = await isBiometricsEnabled(user.id);
      if (!enabled) {
        throw new ApiError("Biometric unlock is not enabled.");
      }

      const result = await promptBiometricAuth(promptMessage);
      if (!result.success) {
        if (silentFailure && result.cancelled) return;

        if (result.error === "not_enrolled") {
          throw new ApiError(BIOMETRIC_NOT_ENROLLED);
        }
        if (result.cancelled) {
          throw new ApiError(BIOMETRIC_CANCELLED);
        }
        throw new ApiError("Biometric unlock failed.");
      }

      await clearPasscodeLockout(user.id);
      setAccessPasscodeUnlocked(true);
      setStatus("authenticated");
    },
    [user],
  );

  const logout = useCallback(async () => {
    if (user) {
      await Promise.all([
        clearAccessPasscode(user.id),
        clearBiometricsEnabled(user.id),
        clearPasscodeLockout(user.id),
        clearRememberedCreatorGroups(user.id),
      ]);
    } else {
      await clearRememberedCreatorGroups();
    }
    await clearSessionStorage();
    clearBanksCache();
    clearQueryCache();
    setAccessTokenState(null);
    setUser(null);
    setAccessPasscodeConfigured(false);
    setAccessPasscodeUnlocked(false);
    setStatus("unauthenticated");
  }, [user]);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logoutRef.current();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

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
      unlockWithBiometrics,
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
      unlockWithBiometrics,
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
