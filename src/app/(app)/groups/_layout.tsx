import { Stack } from "expo-router";

export default function GroupRoutesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade", animationDuration: 200 }} />
      <Stack.Screen name="[groupId]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="create" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="join" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="invite" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
