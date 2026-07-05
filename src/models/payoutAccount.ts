export type PayoutAccount = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName?: string;
};

export type SetupBankPayload = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export type PayoutAccountStatus = {
  configured: boolean;
  account: PayoutAccount | null;
};
