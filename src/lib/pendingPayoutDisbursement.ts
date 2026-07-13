import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ajoledger.pendingPayoutDisbursement";

export type PendingPayoutDisbursement = {
  groupId: string;
  round: number;
  initiatedAt: string;
};

type PendingMap = Record<string, PendingPayoutDisbursement>;

async function readMap(): Promise<PendingMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as PendingMap;
  } catch {
    return {};
  }
}

export async function getPendingPayoutDisbursement(
  groupId: string,
): Promise<PendingPayoutDisbursement | null> {
  const map = await readMap();
  return map[groupId] ?? null;
}

export async function rememberPendingPayoutDisbursement(
  entry: PendingPayoutDisbursement,
): Promise<void> {
  const map = await readMap();
  map[entry.groupId] = entry;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function clearPendingPayoutDisbursement(
  groupId: string,
): Promise<void> {
  const map = await readMap();
  if (!map[groupId]) {
    return;
  }

  delete map[groupId];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Clears pending state once the active round advances past the initiated round. */
export async function reconcilePendingPayoutDisbursement(
  groupId: string,
  currentRound: number,
): Promise<PendingPayoutDisbursement | null> {
  const pending = await getPendingPayoutDisbursement(groupId);
  if (!pending) {
    return null;
  }

  if (currentRound > pending.round) {
    await clearPendingPayoutDisbursement(groupId);
    return null;
  }

  return pending;
}
