import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../context/AuthProvider";

export default function AppLayout() {
  const { status } = useAuth();

  if (status === "booting") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/register" />;
  }

  if (status === "needsPinSetup") {
    return <Redirect href="/setup-pin" />;
  }

  if (status === "needsPinEntry") {
    return <Redirect href="/enter-pin" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
