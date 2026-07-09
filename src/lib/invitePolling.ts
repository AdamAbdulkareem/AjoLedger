import {
  GROUP_INVITE_POLL_INITIAL_MS,
  nextInvitePollDelayMs,
} from "./groupInvite";

type InvitePollingOptions = {
  poll: () => void | Promise<void>;
  getMemberCount: () => number;
  enabled: boolean;
};

/**
 * Polls with exponential backoff when the member count is unchanged.
 * Resets to the initial interval when a new member joins.
 */
export function startInvitePolling({
  poll,
  getMemberCount,
  enabled,
}: InvitePollingOptions): () => void {
  if (!enabled) {
    return () => undefined;
  }

  let cancelled = false;
  let delayMs = GROUP_INVITE_POLL_INITIAL_MS;
  let lastMemberCount = getMemberCount();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const scheduleNext = () => {
    if (cancelled) return;

    timeoutId = setTimeout(() => {
      void (async () => {
        if (cancelled) return;

        await poll();

        if (cancelled) return;

        const currentCount = getMemberCount();
        if (currentCount !== lastMemberCount) {
          lastMemberCount = currentCount;
          delayMs = GROUP_INVITE_POLL_INITIAL_MS;
        } else {
          delayMs = nextInvitePollDelayMs(delayMs);
        }

        scheduleNext();
      })();
    }, delayMs);
  };

  scheduleNext();

  return () => {
    cancelled = true;
    if (timeoutId != null) {
      clearTimeout(timeoutId);
    }
  };
}
