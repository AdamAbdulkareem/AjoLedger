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

export type UserWithPayout = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  payoutBankCode: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  /** Present on GET /users/me when backend exposes PIN status. */
  hasTransactionPin?: boolean;
  createdAt: string;
  updatedAt: string;
};
