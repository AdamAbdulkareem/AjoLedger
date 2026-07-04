import AsyncStorage from "@react-native-async-storage/async-storage";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const ACCESS_PASSCODE_LENGTH = 6;

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DK_LEN = 32;

const ACCESS_PASSCODE_HASH_PREFIX = "auth_access_passcode_hash_";
const ACCESS_PASSCODE_SALT_PREFIX = "auth_access_passcode_salt_";
/** @deprecated Renamed from passcode — read fallback only. */
const LEGACY_ACCESS_PASSWORD_HASH_PREFIX = "auth_access_password_hash_";
const LEGACY_ACCESS_PASSWORD_SALT_PREFIX = "auth_access_password_salt_";
/** @deprecated Legacy flag from the old PIN flow — cleared on logout/setup. */
const LEGACY_PIN_CONFIGURED_PREFIX = "auth_pin_configured_";

function hashKey(userId: string) {
  return `${ACCESS_PASSCODE_HASH_PREFIX}${userId}`;
}

function saltKey(userId: string) {
  return `${ACCESS_PASSCODE_SALT_PREFIX}${userId}`;
}

function legacyHashKey(userId: string) {
  return `${LEGACY_ACCESS_PASSWORD_HASH_PREFIX}${userId}`;
}

function legacySaltKey(userId: string) {
  return `${LEGACY_ACCESS_PASSWORD_SALT_PREFIX}${userId}`;
}

function legacyPinConfiguredKey(userId: string) {
  return `${LEGACY_PIN_CONFIGURED_PREFIX}${userId}`;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

async function readStoredCredentials(userId: string): Promise<{
  hash: string | null;
  salt: string | null;
}> {
  const [hash, salt, legacyHash, legacySalt] = await Promise.all([
    getSecureItem(hashKey(userId)),
    getSecureItem(saltKey(userId)),
    getSecureItem(legacyHashKey(userId)),
    getSecureItem(legacySaltKey(userId)),
  ]);

  return {
    hash: hash ?? legacyHash,
    salt: salt ?? legacySalt,
  };
}

async function createSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(bytes);
}

/** @deprecated Pre-PBKDF2 verifier kept for existing local passcodes. */
function hashAccessPasscodeLegacy(passcode: string, salt: string): string {
  const input = `${salt}:${passcode}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ ch, 0x01000193);
  }

  return `${(h1 >>> 0).toString(16).padStart(8, "0")}${(h2 >>> 0).toString(16).padStart(8, "0")}`;
}

function hashAccessPasscode(passcode: string, saltHex: string): string {
  const derived = pbkdf2(sha256, utf8ToBytes(passcode), hexToBytes(saltHex), {
    c: PBKDF2_ITERATIONS,
    dkLen: PBKDF2_DK_LEN,
  });
  return bytesToHex(derived);
}

export function normalizeAccessPasscode(input: string): string {
  return input.replace(/\D/g, "").slice(0, ACCESS_PASSCODE_LENGTH);
}

export function isValidAccessPasscode(passcode: string): boolean {
  return new RegExp(`^\\d{${ACCESS_PASSCODE_LENGTH}}$`).test(passcode);
}

export async function hasAccessPasscode(userId: string): Promise<boolean> {
  try {
    const { hash } = await readStoredCredentials(userId);
    return !!hash;
  } catch {
    return false;
  }
}

export async function saveAccessPasscode(
  userId: string,
  passcode: string,
): Promise<void> {
  if (!isValidAccessPasscode(passcode)) {
    throw new Error("Access passcode must be 6 digits.");
  }

  const salt = await createSalt();
  const hash = hashAccessPasscode(passcode, salt);

  await Promise.all([
    setSecureItem(hashKey(userId), hash),
    setSecureItem(saltKey(userId), salt),
    deleteSecureItem(legacyHashKey(userId)),
    deleteSecureItem(legacySaltKey(userId)),
    deleteSecureItem(legacyPinConfiguredKey(userId)),
  ]);
}

export async function verifyAccessPasscode(
  userId: string,
  passcode: string,
): Promise<boolean> {
  if (!isValidAccessPasscode(passcode)) return false;

  try {
    const { hash: storedHash, salt } = await readStoredCredentials(userId);
    if (!storedHash || !salt) return false;

    if (storedHash.length === PBKDF2_DK_LEN * 2) {
      return hashAccessPasscode(passcode, salt) === storedHash;
    }

    return hashAccessPasscodeLegacy(passcode, salt) === storedHash;
  } catch {
    return false;
  }
}

export async function clearAccessPasscode(userId: string): Promise<void> {
  try {
    await Promise.all([
      deleteSecureItem(hashKey(userId)),
      deleteSecureItem(saltKey(userId)),
      deleteSecureItem(legacyHashKey(userId)),
      deleteSecureItem(legacySaltKey(userId)),
      deleteSecureItem(legacyPinConfiguredKey(userId)),
    ]);
  } catch {
    // Storage unavailable — skip silently.
  }
}
