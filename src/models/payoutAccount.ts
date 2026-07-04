export type PayoutAccount = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
};

export type SavePayoutAccountPayload = PayoutAccount;

export type PayoutAccountStatus = {
  configured: boolean;
  account: PayoutAccount | null;
};
