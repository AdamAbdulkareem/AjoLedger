jest.mock("expo-local-authentication", () => ({
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("../biometricStorage", () => ({
  isBiometricsEnabled: jest.fn(),
}));

import { resolveBiometricKind } from "../biometricAuth";

const FINGERPRINT = 1;
const FACIAL_RECOGNITION = 2;

describe("resolveBiometricKind", () => {
  it("prefers fingerprint on Android when both types are reported", () => {
    expect(resolveBiometricKind([FINGERPRINT, FACIAL_RECOGNITION], "android")).toBe(
      "fingerprint",
    );
  });

  it("uses face ID on Android when only facial recognition is available", () => {
    expect(resolveBiometricKind([FACIAL_RECOGNITION], "android")).toBe("faceId");
  });

  it("uses fingerprint on Android when only fingerprint is available", () => {
    expect(resolveBiometricKind([FINGERPRINT], "android")).toBe("fingerprint");
  });

  it("prefers face ID on iOS when both types are reported", () => {
    expect(resolveBiometricKind([FINGERPRINT, FACIAL_RECOGNITION], "ios")).toBe(
      "faceId",
    );
  });

  it("uses fingerprint on iOS for Touch ID devices", () => {
    expect(resolveBiometricKind([FINGERPRINT], "ios")).toBe("fingerprint");
  });

  it("returns biometrics when no supported types are reported", () => {
    expect(resolveBiometricKind([], "android")).toBe("biometrics");
    expect(resolveBiometricKind([], "ios")).toBe("biometrics");
  });
});
