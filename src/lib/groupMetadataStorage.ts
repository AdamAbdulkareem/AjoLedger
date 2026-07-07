import AsyncStorage from "@react-native-async-storage/async-storage";

const GROUP_METADATA_KEY = "ajoledger.groupMetadata";

export type StoredGroupMetadata = {
  numberOfParticipants: number;
};

type GroupMetadataMap = Record<string, StoredGroupMetadata>;

async function readMetadataMap(): Promise<GroupMetadataMap> {
  try {
    const raw = await AsyncStorage.getItem(GROUP_METADATA_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as GroupMetadataMap;
  } catch {
    return {};
  }
}

export async function rememberGroupMetadata(
  groupId: string,
  metadata: StoredGroupMetadata,
): Promise<void> {
  const map = await readMetadataMap();
  map[groupId] = metadata;
  await AsyncStorage.setItem(GROUP_METADATA_KEY, JSON.stringify(map));
}

export async function getStoredGroupMetadata(
  groupId: string,
): Promise<StoredGroupMetadata | null> {
  const map = await readMetadataMap();
  return map[groupId] ?? null;
}
