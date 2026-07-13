import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../context/AuthProvider";

export default function AppLayout() {
  const { status, accountDeactivated } = useAuth();

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

  if (accountDeactivated) {
    return <Redirect href="/reactivate-account" />;
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
      <Stack.Screen
        name="change-password"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="delete-account"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="contact-support"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="support-email"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="support-phone"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="support-message"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="support-confirmation"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="setup-transaction-pin"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
