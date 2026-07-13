type VoidHandler = () => void;

let unauthorizedHandler: VoidHandler | null = null;
let deactivatedHandler: VoidHandler | null = null;

export function setUnauthorizedHandler(handler: VoidHandler | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

export function setAccountDeactivatedHandler(
  handler: VoidHandler | null,
): void {
  deactivatedHandler = handler;
}

export function notifyAccountDeactivated(): void {
  deactivatedHandler?.();
}
