import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

export function invalidateUserQueries(token: string | null): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.currentUser(token),
  });
}

export function invalidateGroupsQueries(token: string | null): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.groups(token),
  });
}

export function invalidateGroupDetailsQueries(
  token: string | null,
  groupId: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: ["groups", groupId, token],
  });
}

export function invalidateBanksQueries(token: string | null): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.banks(token),
  });
}
