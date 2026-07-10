/**
 * Nigerian currency boundary for the AjoLedger API.
 *
 * - Wire (JSON): kobo integers only (₦5,000 → 500_000).
 * - App (forms, models, UI): naira via `formatNaira`.
 *
 * Reads: `readKoboAsNaira` in `groupApiNormalize.ts` / `activity.ts`.
 * Writes: `nairaToKobo` in `api/groups.ts` (extend for new money endpoints).
 */
/** Nigerian currency: API / Nomba use kobo; UI and forms use naira. */
export const KOBO_PER_NAIRA = 100;

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) {
    throw new Error("Invalid naira amount.");
  }

  return Math.round(naira * KOBO_PER_NAIRA);
}

export function koboToNaira(kobo: number): number {
  if (!Number.isFinite(kobo)) {
    return 0;
  }

  return kobo / KOBO_PER_NAIRA;
}

/** Parses API money fields (kobo) into naira for in-app use. */
export function readKoboAsNaira(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return koboToNaira(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return koboToNaira(parsed);
    }
  }

  return undefined;
}
