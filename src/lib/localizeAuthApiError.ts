import type { TFunction } from "i18next";

import { ApiError } from "../api/client";

export function localizeAuthApiError(error: ApiError, t: TFunction): string {
  const message = error.message.toLowerCase();

  if (
    message.includes("email") &&
    (message.includes("invalid") ||
      message.includes("incorrect") ||
      message.includes("valid"))
  ) {
    return t("auth.errors.invalidEmail");
  }

  if (message.includes("password") && message.includes("8")) {
    return t("auth.errors.weakPassword");
  }

  if (message.includes("password") && message.includes("required")) {
    return t("auth.errors.passwordRequired");
  }

  return t("auth.errors.generic");
}
