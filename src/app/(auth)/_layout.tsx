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

  if (status === "needsPasscodeSetup") {
    return <Redirect href="/setup-access-passcode" />;
  }

  if (status === "needsPasscodeEntry") {
    return <Redirect href="/enter-access-passcode" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
