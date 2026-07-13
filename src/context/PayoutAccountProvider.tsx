import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  findBankName,
  isPayoutConfigured,
  payoutAccountFromUser,
} from "../api/banks";
import { saveSetupBank, savePayoutSettings } from "../api/payoutAccount";
import { ApiError } from "../api/client";
import { clearBankSetupSkipped } from "../lib/bankSetupSkipStorage";
import {
  invalidateBanksQueries,
  invalidateUserQueries,
} from "../lib/invalidateQueries";
import { useAuth } from "./AuthProvider";
import { useCurrentUser } from "./CurrentUserProvider";
import { useBanksQuery } from "../hooks/queries/useBanksQuery";
import type { PayoutAccount, SetupBankPayload, UpdatePayoutSettingsPayload } from "../models/payoutAccount";

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
  updatePayoutBank: (
    payload: UpdatePayoutSettingsPayload,
  ) => Promise<"success" | "failed">;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const PayoutAccountContext = createContext<PayoutAccountContextValue | null>(
  null,
);

export function PayoutAccountProvider({ children }: { children: ReactNode }) {
  const { accessToken, user, status } = useAuth();
  const userId = user?.id;
  const isAuthenticated = status === "authenticated";
  const {
    currentUser,
    loading: userLoading,
    error: userError,
  } = useCurrentUser();

  const payoutConfigured = currentUser
    ? isPayoutConfigured(currentUser)
    : null;

  const banksQuery = useBanksQuery(
    accessToken,
    isAuthenticated && payoutConfigured === true,
  );

  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const hasPayoutAccount = useMemo(() => {
    if (!isAuthenticated || !accessToken || !userId) return null;
    if (userLoading || !currentUser) return null;
    return payoutConfigured === true;
  }, [
    isAuthenticated,
    accessToken,
    userId,
    userLoading,
    currentUser,
    payoutConfigured,
  ]);

  const account = useMemo(() => {
    if (!currentUser || payoutConfigured !== true) return null;

    const bankName = banksQuery.data
      ? findBankName(banksQuery.data, currentUser.payoutBankCode!)
      : undefined;

    return payoutAccountFromUser(currentUser, bankName);
  }, [currentUser, payoutConfigured, banksQuery.data]);

  const loading =
    isAuthenticated &&
    (userLoading || (payoutConfigured === true && banksQuery.isLoading));

  const error = userError ?? resolveQueryError(banksQuery.error) ?? mutationError;

  const refresh = useCallback(async () => {
    await Promise.all([
      invalidateUserQueries(accessToken),
      payoutConfigured ? invalidateBanksQueries(accessToken) : Promise.resolve(),
    ]);
  }, [accessToken, payoutConfigured]);

  const clearError = useCallback(() => {
    setMutationError(null);
  }, []);

  const setupBank = useCallback(
    async (
      payload: SetupBankPayload,
      _bankName: string,
    ): Promise<"success" | "failed" | "already_configured"> => {
      if (!accessToken || !userId || status !== "authenticated") return "failed";

      setSaving(true);
      setMutationError(null);

      try {
        const result = await saveSetupBank(accessToken, payload);
        await Promise.all([
          invalidateUserQueries(accessToken),
          invalidateBanksQueries(accessToken),
        ]);

        if (result.configured) {
          await clearBankSetupSkipped(userId);
        }

        return "success";
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setMutationError(message);
        if (isBankAlreadyConfiguredError(err)) {
          return "already_configured";
        }
        return "failed";
      } finally {
        setSaving(false);
      }
    },
    [accessToken, userId, status],
  );

  const updatePayoutBank = useCallback(
    async (
      payload: UpdatePayoutSettingsPayload,
    ): Promise<"success" | "failed"> => {
      if (!accessToken || !userId || status !== "authenticated") return "failed";

      setSaving(true);
      setMutationError(null);

      try {
        await savePayoutSettings(accessToken, payload);
        await Promise.all([
          invalidateUserQueries(accessToken),
          invalidateBanksQueries(accessToken),
        ]);
        return "success";
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
        setMutationError(message);
        return "failed";
      } finally {
        setSaving(false);
      }
    },
    [accessToken, userId, status],
  );

  const value = useMemo<PayoutAccountContextValue>(
    () => ({
      hasPayoutAccount,
      account,
      loading,
      saving,
      error,
      setupBank,
      updatePayoutBank,
      refresh,
      clearError,
    }),
    [
      hasPayoutAccount,
      account,
      loading,
      saving,
      error,
      setupBank,
      updatePayoutBank,
      refresh,
      clearError,
    ],
  );

  return (
    <PayoutAccountContext.Provider value={value}>
      {children}
    </PayoutAccountContext.Provider>
  );
}

function resolveQueryError(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
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

export function isBankAlreadyConfiguredError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400;
}
