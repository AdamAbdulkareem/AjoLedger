/**
 * Nigerian currency boundary for the AjoLedger API.
 *
 * - App (forms, models, UI): naira via `formatNaira`.
 * - GET responses: kobo in JSON → `readKoboAsNaira` (÷ 100).
 * - POST /groups: send `contributionAmount` in **naira** (backend converts to kobo).
 * - Other write endpoints: confirm per endpoint; use `nairaToKobo` when API expects kobo.
 */
/** Nigerian currency: DB/API reads use kobo; UI and forms use naira. */
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
