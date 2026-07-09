import { useQuery } from "@tanstack/react-query";

import { getBanks } from "../../api/banks";
import { ApiError } from "../../api/client";
import { queryKeys } from "../../lib/queryKeys";

export function useBanksQuery(
  accessToken: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.banks(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiError("You are not signed in.");
      }
      return getBanks(accessToken);
    },
    enabled: enabled && !!accessToken,
    staleTime: 5 * 60_000,
  });
}
