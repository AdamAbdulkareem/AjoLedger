import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getPayoutAccountStatus,
  saveSetupBank,
} from "../api/payoutAccount";
import { ApiError } from "../api/client";
import { useAuth } from "./AuthProvider";
import type { PayoutAccount, SetupBankPayload } from "../models/payoutAccount";

type PayoutAccountContextValue = {
  /** null while checking, false when setup is required, true when configured. */
  hasPayoutAccount: boolean | null;
  account: PayoutAccount | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setupBank: (
    payload: SetupBankPayload,
    bankName: string,
  ) => Promise<"success" | "failed" | "already_configured">;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const PayoutAccountContext = createContext<PayoutAccountContextValue | null>(
  null,
);

export function PayoutAccountProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();
  const userId = user?.id;
  const requestIdRef = useRef(0);

  const [hasPayoutAccount, setHasPayoutAccount] = useState<boolean | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!accessToken || !userId) {
      if (requestId !== requestIdRef.current) return;
      setHasPayoutAccount(null);
      setAccount(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await getPayoutAccountStatus(accessToken, userId);
      if (requestId !== requestIdRef.current) return;
      setHasPayoutAccount(status.configured);
      setAccount(status.account);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setHasPayoutAccount(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setupBank = useCallback(
    async (
      payload: SetupBankPayload,
      bankName: string,
    ): Promise<"success" | "failed" | "already_configured"> => {
      if (!accessToken || !userId) return "failed";

      setSaving(true);
      setError(null);

      try {
        const status = await saveSetupBank(accessToken, payload, userId);
        setHasPayoutAccount(status.configured);
        setAccount(
          status.account
            ? { ...status.account, bankName }
            : null,
        );
        return "success";
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
        if (isBankAlreadyConfiguredError(message)) {
          return "already_configured";
        }
        return "failed";
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
      setupBank,
      refresh,
      clearError,
    }),
    [hasPayoutAccount, account, loading, saving, error, setupBank, refresh, clearError],
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

export function isBankAlreadyConfiguredError(message: string): boolean {
  return message.includes("already configured");
}
