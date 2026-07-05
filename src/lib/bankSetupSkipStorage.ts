import AsyncStorage from "@react-native-async-storage/async-storage";

function skipKey(userId: string) {
  return `bank_setup_skipped_${userId}`;
}

export async function getBankSetupSkipped(userId: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(skipKey(userId));
    return value === "true";
  } catch {
    return false;
  }
}

export async function setBankSetupSkipped(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(skipKey(userId), "true");
  } catch {
    // Storage unavailable — skip silently.
  }
}

export async function clearBankSetupSkipped(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(skipKey(userId));
  } catch {
    // Storage unavailable — skip silently.
  }
}
