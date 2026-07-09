import "../lib/sentryInit";

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "../components/ErrorBoundary";
import { initI18n } from "../i18n";
import { AuthProvider } from "../context/AuthProvider";
import { CurrentUserProvider } from "../context/CurrentUserProvider";
import { PayoutAccountProvider } from "../context/PayoutAccountProvider";
import { ProfileProvider } from "../context/ProfileProvider";
import { queryClient } from "../lib/queryClient";
import { wrapRoot } from "../lib/observability";
import { ThemeProvider } from "../theme";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthProvider>
              <CurrentUserProvider>
                <ProfileProvider>
                  <PayoutAccountProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                  </PayoutAccountProvider>
                </ProfileProvider>
              </CurrentUserProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default wrapRoot(RootLayout);
