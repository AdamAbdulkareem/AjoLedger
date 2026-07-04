import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initI18n } from "../i18n";
import { AuthProvider } from "../context/AuthProvider";
import { PayoutAccountProvider } from "../context/PayoutAccountProvider";
import { ProfileProvider } from "../context/ProfileProvider";
import { ThemeProvider } from "../theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <PayoutAccountProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </PayoutAccountProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
