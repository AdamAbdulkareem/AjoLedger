import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

import { isBiometricsEnabled } from "./biometricStorage";

export type BiometricKind = "faceId" | "fingerprint" | "biometrics";

export type BiometricCapabilities = {
  available: boolean;
  enrolled: boolean;
  kind: BiometricKind;
};

export async function getBiometricCapabilities(): Promise<BiometricCapabilities> {
  if (Platform.OS === "web") {
    return { available: false, enrolled: false, kind: "biometrics" };
  }

  const [hasHardware, isEnrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    available: hasHardware,
    enrolled: isEnrolled,
    kind: resolveBiometricKind(types),
  };
}

/** Exported for unit tests; defaults to the current platform. */
export function resolveBiometricKind(
  types: LocalAuthentication.AuthenticationType[],
  os: typeof Platform.OS = Platform.OS,
): BiometricKind {
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );
  const hasFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );

  // Android often reports both fingerprint and face unlock; prefer fingerprint
  // for UI labels since that is what most users actually use.
  if (os === "android") {
    if (hasFingerprint) return "fingerprint";
    if (hasFace) return "faceId";
    return "biometrics";
  }

  if (hasFace) return "faceId";
  if (hasFingerprint) return "fingerprint";
  return "biometrics";
}

export async function loadBiometricStatus(userId: string): Promise<{
  enabled: boolean;
  caps: BiometricCapabilities;
} | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const [enabled, caps] = await Promise.all([
      isBiometricsEnabled(userId),
      getBiometricCapabilities(),
    ]);
    return { enabled, caps };
  } catch {
    return null;
  }
}

export function getBiometricProfileLabelKey(kind: BiometricKind): string {
  switch (kind) {
    case "faceId":
      return "profile.rows.faceId";
    case "fingerprint":
      return "profile.rows.fingerprint";
    default:
      return "profile.rows.biometrics";
  }
}

export function getBiometricUnlockLabelKey(kind: BiometricKind): string {
  switch (kind) {
    case "faceId":
      return "auth.unlockWithFaceId";
    case "fingerprint":
      return "auth.unlockWithFingerprint";
    default:
      return "auth.unlockWithBiometrics";
  }
}

export type BiometricAuthResult =
  | { success: true }
  | { success: false; cancelled: boolean; error?: string };

export async function promptBiometricAuth(
  promptMessage: string,
): Promise<BiometricAuthResult> {
  if (Platform.OS === "web") {
    return { success: false, cancelled: false, error: "not_available" };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { success: true };
  }

  const cancelled =
    result.error === "user_cancel" ||
    result.error === "system_cancel" ||
    result.error === "app_cancel";

  return { success: false, cancelled, error: result.error };
}
