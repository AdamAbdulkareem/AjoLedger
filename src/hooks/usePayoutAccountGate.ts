import { useCallback, useEffect, useState } from "react";

import {
  getPayoutAccountStatus,
  savePayoutAccount,
} from "../api/payoutAccount";
import { ApiError } from "../api/client";
import type { PayoutAccount, SavePayoutAccountPayload } from "../models/payoutAccount";

type UsePayoutAccountGateResult = {
  /** null while checking, false when setup is required, true when configured. */
  hasPayoutAccount: boolean | null;
  account: PayoutAccount | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (payload: SavePayoutAccountPayload) => Promise<boolean>;
  refresh: () => Promise<void>;
};

export function usePayoutAccountGate(
  token: string | null,
  userId: string | undefined,
): UsePayoutAccountGateResult {
  const [hasPayoutAccount, setHasPayoutAccount] = useState<boolean | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !userId) {
      setHasPayoutAccount(null);
      setAccount(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await getPayoutAccountStatus(token, userId);
      setHasPayoutAccount(status.configured);
      setAccount(status.account);
    } catch (err) {
      setHasPayoutAccount(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (payload: SavePayoutAccountPayload): Promise<boolean> => {
      if (!token || !userId) return false;

      setSaving(true);
      setError(null);

      try {
        await savePayoutAccount(token, userId, payload);
        setHasPayoutAccount(true);
        setAccount(payload);
        return true;
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [token, userId],
  );

  return { hasPayoutAccount, account, loading, saving, error, save, refresh };
}
