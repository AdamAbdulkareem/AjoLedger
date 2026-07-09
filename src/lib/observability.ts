import * as Sentry from "@sentry/react-native";
import type { ComponentType } from "react";

import type { User } from "../models/auth";

type ErrorContext = Record<string, unknown>;

let sentryInitialized = false;
let sentryActive = false;

function getSentryDsn(): string | undefined {
  return process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

export function isSentryEnabled(): boolean {
  return sentryActive;
}

export function initObservability(): void {
  if (sentryInitialized) {
    return;
  }
  sentryInitialized = true;

  const dsn = getSentryDsn();
  if (!dsn) {
    // No DSN: do not call Sentry.init/wrap — avoids App Start Span warnings in Expo Go.
    return;
  }

  const debugEnabled = process.env.EXPO_PUBLIC_SENTRY_DEBUG === "true";

  Sentry.init({
    dsn,
    debug: debugEnabled,
    enabled: !__DEV__ || debugEnabled,
    tracesSampleRate: __DEV__ ? 0 : 0.2,
    integrations: [
      Sentry.reactNativeTracingIntegration({
        traceFetch: !__DEV__,
      }),
      Sentry.breadcrumbsIntegration({
        fetch: !__DEV__,
      }),
    ],
  });

  sentryActive = true;

  setErrorReporter((error, context) => {
    Sentry.captureException(error, { extra: context });
  });
}

/**
 * Wrap the root with Sentry only when a DSN is configured and init ran.
 * Otherwise return the component unchanged (Expo Go / local without Sentry).
 */
export function wrapRoot<P extends Record<string, unknown>>(
  Root: ComponentType<P>,
): ComponentType<P> {
  if (!sentryActive) {
    return Root;
  }

  return Sentry.wrap(Root);
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
  if (!sentryActive) {
    return;
  }

  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
    return;
  }

  Sentry.setUser(null);
}

export { Sentry };
