export type PayoutAccount = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
};

export type SavePayoutAccountPayload = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
};

export type PayoutAccountStatus = {
  configured: boolean;
  account: PayoutAccount | null;
};
