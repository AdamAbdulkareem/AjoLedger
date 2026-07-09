import * as Sentry from "@sentry/react-native";

import type { User } from "../models/auth";

type ErrorContext = Record<string, unknown>;

let sentryInitialized = false;

function getSentryDsn(): string | undefined {
  return process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

export function isSentryEnabled(): boolean {
  return sentryInitialized;
}

export function initObservability(): void {
  const dsn = getSentryDsn();
  if (!dsn || sentryInitialized) {
    return;
  }

  const debugEnabled = process.env.EXPO_PUBLIC_SENTRY_DEBUG === "true";

  Sentry.init({
    dsn,
    debug: debugEnabled,
    enabled: !__DEV__ || debugEnabled,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    integrations: [
      Sentry.reactNativeTracingIntegration({ traceFetch: true }),
      Sentry.breadcrumbsIntegration({ fetch: true }),
    ],
  });

  sentryInitialized = true;

  setErrorReporter((error, context) => {
    Sentry.captureException(error, { extra: context });
  });
}

let errorReporter: ((error: unknown, context?: ErrorContext) => void) | null =
  null;

export function setErrorReporter(
  reporter: ((error: unknown, context?: ErrorContext) => void) | null,
): void {
  errorReporter = reporter;
}

export function reportError(error: unknown, context?: ErrorContext): void {
  console.error("[AjoLedger]", error, context);

  if (errorReporter) {
    try {
      errorReporter(error, context);
    } catch (reportingError) {
      console.error("[AjoLedger] Error reporter failed:", reportingError);
    }
  }
}

export function setObservabilityUser(user: User | null): void {
  if (!sentryInitialized) {
    return;
  }

  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
    return;
  }

  Sentry.setUser(null);
}

export { Sentry };
