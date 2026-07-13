import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../context/AuthProvider";

const SLIDE_FROM_RIGHT_SCREENS = [
  "edit-profile",
  "change-password",
  "delete-account",
  "contact-support",
  "support-email",
  "support-phone",
  "support-message",
  "support-confirmation",
  "setup-transaction-pin",
] as const;

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
      {SLIDE_FROM_RIGHT_SCREENS.map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          options={{ animation: "slide_from_right" }}
        />
      ))}
    </Stack>
  );
}
