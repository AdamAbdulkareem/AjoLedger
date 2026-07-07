import AsyncStorage from "@react-native-async-storage/async-storage";

const CREATOR_GROUP_IDS_KEY = "ajoledger.creatorGroupIds";

async function readCreatorGroupIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(CREATOR_GROUP_IDS_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export async function rememberCreatorGroup(groupId: string): Promise<void> {
  const ids = await readCreatorGroupIds();
  ids.add(groupId);
  await AsyncStorage.setItem(
    CREATOR_GROUP_IDS_KEY,
    JSON.stringify([...ids]),
  );
}

export async function getRememberedCreatorGroupIds(): Promise<Set<string>> {
  return readCreatorGroupIds();
}

export async function isRememberedCreatorGroup(
  groupId: string,
): Promise<boolean> {
  const ids = await readCreatorGroupIds();
  return ids.has(groupId);
}
