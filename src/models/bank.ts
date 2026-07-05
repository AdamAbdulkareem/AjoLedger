export type Bank = {
  bankCode: string;
  bankName: string;
};

export type ResolveAccountPayload = {
  bankCode: string;
  accountNumber: string;
};

export type ResolveAccountResult = {
  accountName: string;
};

export type SetupBankPayload = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export type UserWithPayout = {
  id: string;
  name: string;
  email: string;
  payoutBankCode: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  createdAt: string;
  updatedAt: string;
};
