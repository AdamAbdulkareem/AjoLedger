import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../context/AuthProvider";

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === "booting") {
    return null;
  }

  if (status === "authenticated") {
    return <Redirect href="/(app)/home" />;
  }

  if (status === "needsPinSetup") {
    return <Redirect href="/setup-pin" />;
  }

  if (status === "needsPinEntry") {
    return <Redirect href="/enter-pin" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
