import { AppState, type AppStateStatus } from "react-native";
import { focusManager, QueryClient } from "@tanstack/react-query";

const STALE_TIME_MS = 30_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

focusManager.setEventListener((handleFocus) => {
  const onAppStateChange = (status: AppStateStatus) => {
    handleFocus(status === "active");
  };

  const subscription = AppState.addEventListener("change", onAppStateChange);
  return () => subscription.remove();
});

export function clearQueryCache(): void {
  queryClient.clear();
}
