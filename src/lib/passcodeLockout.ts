import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "./secureStorage";

const FAILED_ATTEMPTS_PREFIX = "auth_passcode_failed_attempts_";
const LOCKOUT_LEVEL_PREFIX = "auth_passcode_lockout_level_";
const LOCKED_UNTIL_PREFIX = "auth_passcode_locked_until_";

export const MAX_PASSCODE_ATTEMPTS = 5;
const INITIAL_LOCKOUT_MS = 30_000;
const MAX_LOCKOUT_MS = 15 * 60 * 1000;

export type PasscodeLockoutStatus = {
  locked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
  maxAttempts: number;
};

function failedAttemptsKey(userId: string) {
  return `${FAILED_ATTEMPTS_PREFIX}${userId}`;
}

function lockoutLevelKey(userId: string) {
  return `${LOCKOUT_LEVEL_PREFIX}${userId}`;
}

function lockedUntilKey(userId: string) {
  return `${LOCKED_UNTIL_PREFIX}${userId}`;
}

async function readNumber(key: string): Promise<number> {
  const raw = await getSecureItem(key);
  if (!raw) return 0;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : 0;
}

function lockoutDurationMs(level: number): number {
  if (level <= 0) return INITIAL_LOCKOUT_MS;
  const duration = INITIAL_LOCKOUT_MS * 2 ** (level - 1);
  return Math.min(duration, MAX_LOCKOUT_MS);
}

export async function getPasscodeLockoutStatus(
  userId: string,
): Promise<PasscodeLockoutStatus> {
  try {
    const [failedAttempts, lockedUntil] = await Promise.all([
      readNumber(failedAttemptsKey(userId)),
      readNumber(lockedUntilKey(userId)),
    ]);

    const now = Date.now();
    if (lockedUntil > now) {
      return {
        locked: true,
        remainingSeconds: Math.ceil((lockedUntil - now) / 1000),
        failedAttempts,
        maxAttempts: MAX_PASSCODE_ATTEMPTS,
      };
    }

    return {
      locked: false,
      remainingSeconds: 0,
      failedAttempts,
      maxAttempts: MAX_PASSCODE_ATTEMPTS,
    };
  } catch {
    return {
      locked: false,
      remainingSeconds: 0,
      failedAttempts: 0,
      maxAttempts: MAX_PASSCODE_ATTEMPTS,
    };
  }
}

export async function recordPasscodeFailure(
  userId: string,
): Promise<PasscodeLockoutStatus> {
  try {
    const failedAttempts = (await readNumber(failedAttemptsKey(userId))) + 1;

    if (failedAttempts < MAX_PASSCODE_ATTEMPTS) {
      await setSecureItem(
        failedAttemptsKey(userId),
        String(failedAttempts),
      );
      return {
        locked: false,
        remainingSeconds: 0,
        failedAttempts,
        maxAttempts: MAX_PASSCODE_ATTEMPTS,
      };
    }

    const lockoutLevel = (await readNumber(lockoutLevelKey(userId))) + 1;
    const lockedUntil = Date.now() + lockoutDurationMs(lockoutLevel);

    await Promise.all([
      setSecureItem(failedAttemptsKey(userId), "0"),
      setSecureItem(lockoutLevelKey(userId), String(lockoutLevel)),
      setSecureItem(lockedUntilKey(userId), String(lockedUntil)),
    ]);

    return {
      locked: true,
      remainingSeconds: Math.ceil(lockoutDurationMs(lockoutLevel) / 1000),
      failedAttempts: 0,
      maxAttempts: MAX_PASSCODE_ATTEMPTS,
    };
  } catch {
    return getPasscodeLockoutStatus(userId);
  }
}

export async function clearPasscodeLockout(userId: string): Promise<void> {
  try {
    await Promise.all([
      deleteSecureItem(failedAttemptsKey(userId)),
      deleteSecureItem(lockoutLevelKey(userId)),
      deleteSecureItem(lockedUntilKey(userId)),
    ]);
  } catch {
    // Storage unavailable — skip silently.
  }
}
