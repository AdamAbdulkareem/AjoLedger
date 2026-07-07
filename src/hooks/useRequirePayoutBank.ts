import { useCallback, useRef, useState } from "react";

import type { SetupBankPayload } from "../models/payoutAccount";
import { useAuth } from "../context/AuthProvider";
import { useCurrentUser } from "../context/CurrentUserProvider";
import { usePayoutAccountGate } from "./usePayoutAccountGate";

export function useRequirePayoutBank() {
  const { accessToken } = useAuth();
  const { refresh: refreshCurrentUser } = useCurrentUser();
  const {
    hasPayoutAccount,
    loading: payoutLoading,
    saving,
    error,
    setupBank,
    clearError,
  } = usePayoutAccountGate();

  const pendingActionRef = useRef<(() => void) | null>(null);
  const [showModal, setShowModal] = useState(false);

  const dismissModal = useCallback(() => {
    setShowModal(false);
    pendingActionRef.current = null;
    clearError();
  }, [clearError]);

  const requireBank = useCallback(
    (action: () => void) => {
      if (payoutLoading) return;

      if (hasPayoutAccount === true) {
        action();
        return;
      }

      pendingActionRef.current = action;
      setShowModal(true);
    },
    [hasPayoutAccount, payoutLoading],
  );

  const handleSubmit = useCallback(
    async (payload: SetupBankPayload, bankName: string) => {
      const result = await setupBank(payload, bankName);

      if (result === "success") {
        setShowModal(false);
        clearError();
        void refreshCurrentUser();
        pendingActionRef.current?.();
        pendingActionRef.current = null;
      }

      return result;
    },
    [setupBank, clearError, refreshCurrentUser],
  );

  return {
    requireBank,
    payoutLoading,
    bankModalProps: {
      visible: showModal,
      accessToken,
      saving,
      error,
      onSubmit: handleSubmit,
      onClearError: clearError,
      variant: "required" as const,
      dismissible: true,
      onClose: dismissModal,
    },
  };
}
