/** Initial poll interval for the creator invitation screen (ms). */
export const GROUP_INVITE_POLL_INITIAL_MS = 15_000;

/** Maximum poll interval after exponential backoff (ms). */
export const GROUP_INVITE_POLL_MAX_MS = 120_000;

/** Multiplier applied after each poll cycle without member changes. */
export const GROUP_INVITE_POLL_MULTIPLIER = 2;

export function nextInvitePollDelayMs(currentDelayMs: number): number {
  const next = currentDelayMs * GROUP_INVITE_POLL_MULTIPLIER;
  return Math.min(next, GROUP_INVITE_POLL_MAX_MS);
}

/** @deprecated Use GROUP_INVITE_POLL_INITIAL_MS with backoff helper. */
export const GROUP_INVITE_POLL_MS = GROUP_INVITE_POLL_INITIAL_MS;
