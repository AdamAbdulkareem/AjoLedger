import { useCallback, useEffect, useRef, useState } from "react";

import { getCurrentCyclePaymentStatus } from "../api/groups";
import {
  PAYMENT_STATUS_POLL_INTERVAL_MS,
  PAYMENT_STATUS_POLL_MAX_ATTEMPTS,
} from "../lib/paymentStatusPolling";
import { reportError } from "../lib/observability";

type UsePaymentStatusPollingOptions = {
  accessToken: string | null;
  groupId: string;
  enabled: boolean;
  onPaid: () => void;
};

type UsePaymentStatusPollingResult = {
  waiting: boolean;
  timedOut: boolean;
  startWaiting: () => void;
  stopWaiting: () => void;
};

export function usePaymentStatusPolling({
  accessToken,
  groupId,
  enabled,
  onPaid,
}: UsePaymentStatusPollingOptions): UsePaymentStatusPollingResult {
  const [waiting, setWaiting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  const startWaiting = useCallback(() => {
    setTimedOut(false);
    setWaiting(true);
  }, []);

  const stopWaiting = useCallback(() => {
    setWaiting(false);
    setTimedOut(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (waiting) {
        stopWaiting();
      }
      return;
    }

    if (!waiting || !accessToken || !groupId) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let pollErrors = 0;
    let lastPollError: unknown;

    const poll = async () => {
      if (cancelled) return;

      attempts += 1;

      try {
        const result = await getCurrentCyclePaymentStatus(accessToken, groupId);
        if (cancelled) return;

        if (result.status === "PAID") {
          setWaiting(false);
          setTimedOut(false);
          onPaidRef.current();
          return;
        }
      } catch (error) {
        if (cancelled) return;

        pollErrors += 1;
        lastPollError = error;

        if (__DEV__) {
          console.warn("[payment-poll] status check failed", {
            groupId,
            attempt: attempts,
            error,
          });
        }
      }

      if (cancelled) return;

      if (attempts >= PAYMENT_STATUS_POLL_MAX_ATTEMPTS) {
        setWaiting(false);
        setTimedOut(true);

        if (pollErrors > 0) {
          reportError(lastPollError ?? new Error("Payment status poll failed"), {
            feature: "payment_status_poll",
            groupId,
            attempts,
            pollErrors,
            timedOut: true,
          });
        } else if (__DEV__) {
          console.warn("[payment-poll] timed out waiting for PAID", {
            groupId,
            attempts,
          });
        }

        return;
      }

      timeoutId = setTimeout(() => {
        void poll();
      }, PAYMENT_STATUS_POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, [accessToken, enabled, groupId, stopWaiting, waiting]);

  return {
    waiting,
    timedOut,
    startWaiting,
    stopWaiting,
  };
}
