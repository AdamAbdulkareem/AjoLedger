type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let deactivatedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

export function setAccountDeactivatedHandler(
  handler: UnauthorizedHandler | null,
): void {
  deactivatedHandler = handler;
}

export function notifyAccountDeactivated(): void {
  deactivatedHandler?.();
}
