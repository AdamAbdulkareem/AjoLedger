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

  if (status === "needsPasscodeSetup") {
    return <Redirect href="/setup-access-passcode" />;
  }

  if (status === "needsPasscodeEntry") {
    return <Redirect href="/enter-access-passcode" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="edit-profile"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
