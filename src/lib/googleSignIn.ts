import Constants from "expo-constants";
import { Platform } from "react-native";

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("GOOGLE_SIGN_IN_CANCELLED");
    this.name = "GoogleSignInCancelledError";
  }
}

export class GoogleSignInNotConfiguredError extends Error {
  constructor() {
    super("GOOGLE_SIGN_IN_NOT_CONFIGURED");
    this.name = "GoogleSignInNotConfiguredError";
  }
}

export class GoogleSignInNotAvailableError extends Error {
  constructor() {
    super("GOOGLE_SIGN_IN_NOT_AVAILABLE");
    this.name = "GoogleSignInNotAvailableError";
  }
}

let configured = false;

function readWebClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || undefined;
}

function readIosClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined;
}

/** True when OAuth client IDs are present in env. */
export function isGoogleSignInConfigured(): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  return Boolean(readWebClientId());
}

/** True when Google sign-in can run on this runtime (not Expo Go). */
export function isGoogleSignInNativeAvailable(): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  // Custom native modules are unavailable in Expo Go.
  return Constants.appOwnership !== "expo";
}

/** Env configured and native module can load (dev/EAS build). */
export function canUseGoogleSignIn(): boolean {
  return isGoogleSignInConfigured() && isGoogleSignInNativeAvailable();
}

export function googleIosUrlScheme(iosClientId: string): string | undefined {
  const trimmed = iosClientId.trim();
  if (!trimmed.endsWith(".apps.googleusercontent.com")) {
    return undefined;
  }

  const clientPrefix = trimmed.replace(".apps.googleusercontent.com", "");
  return `com.googleusercontent.apps.${clientPrefix}`;
}

async function loadGoogleSignInModule() {
  if (!isGoogleSignInNativeAvailable()) {
    throw new GoogleSignInNotAvailableError();
  }

  try {
    return await import("@react-native-google-signin/google-signin");
  } catch {
    throw new GoogleSignInNotAvailableError();
  }
}

async function ensureGoogleSignInConfigured(
  GoogleSignin: Awaited<ReturnType<typeof loadGoogleSignInModule>>["GoogleSignin"],
) {
  if (configured) {
    return;
  }

  const webClientId = readWebClientId();
  if (!webClientId) {
    throw new GoogleSignInNotConfiguredError();
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: readIosClientId(),
    offlineAccess: false,
  });
  configured = true;
}

export async function signInWithGoogleIdToken(): Promise<string> {
  if (Platform.OS === "web") {
    throw new Error("Google sign-in is not available on web yet.");
  }

  if (!isGoogleSignInConfigured()) {
    throw new GoogleSignInNotConfiguredError();
  }

  const { GoogleSignin, isErrorWithCode, statusCodes } =
    await loadGoogleSignInModule();
  await ensureGoogleSignInConfigured(GoogleSignin);

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();

    if (result.type === "cancelled") {
      throw new GoogleSignInCancelledError();
    }

    const idToken = result.data.idToken;
    if (!idToken) {
      throw new Error("Google did not return an ID token.");
    }

    return idToken;
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) {
      throw error;
    }

    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new GoogleSignInCancelledError();
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Google sign-in is already in progress.");
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is not available on this device.");
      }
    }

    throw error;
  }
}
