import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getPayoutAccountStatus,
  savePayoutAccount,
} from "../api/payoutAccount";
import { ApiError } from "../api/client";
import { useAuth } from "./AuthProvider";
import type { PayoutAccount, SavePayoutAccountPayload } from "../models/payoutAccount";

type PayoutAccountContextValue = {
  /** null while checking, false when setup is required, true when configured. */
  hasPayoutAccount: boolean | null;
  account: PayoutAccount | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (payload: SavePayoutAccountPayload) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const PayoutAccountContext = createContext<PayoutAccountContextValue | null>(
  null,
);

export function PayoutAccountProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();
  const userId = user?.id;

  const [hasPayoutAccount, setHasPayoutAccount] = useState<boolean | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken || !userId) {
      setHasPayoutAccount(null);
      setAccount(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await getPayoutAccountStatus(accessToken, userId);
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
  }, [accessToken, userId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!accessToken || !userId) {
        if (cancelled) return;
        setHasPayoutAccount(null);
        setAccount(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const status = await getPayoutAccountStatus(accessToken, userId);
        if (cancelled) return;
        setHasPayoutAccount(status.configured);
        setAccount(status.account);
      } catch (err) {
        if (cancelled) return;
        setHasPayoutAccount(null);
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, userId]);

  const save = useCallback(
    async (payload: SavePayoutAccountPayload): Promise<boolean> => {
      if (!accessToken || !userId) return false;

      setSaving(true);
      setError(null);

      try {
        await savePayoutAccount(accessToken, userId, payload);
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
    [accessToken, userId],
  );

  const value = useMemo<PayoutAccountContextValue>(
    () => ({
      hasPayoutAccount,
      account,
      loading,
      saving,
      error,
      save,
      refresh,
    }),
    [hasPayoutAccount, account, loading, saving, error, save, refresh],
  );

  return (
    <PayoutAccountContext.Provider value={value}>
      {children}
    </PayoutAccountContext.Provider>
  );
}

export function usePayoutAccountGate(): PayoutAccountContextValue {
  const context = useContext(PayoutAccountContext);
  if (!context) {
    throw new Error(
      "usePayoutAccountGate must be used within PayoutAccountProvider",
    );
  }
  return context;
}
