let pendingOpenBankModal = false;

export function setPendingOpenBankModal(): void {
  pendingOpenBankModal = true;
}

export function consumePendingOpenBankModal(): boolean {
  const pending = pendingOpenBankModal;
  pendingOpenBankModal = false;
  return pending;
}
