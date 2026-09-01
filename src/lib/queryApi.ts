import {
  useMutation,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/react-query";

import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

export async function fetchCached<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  staleTime = 30_000
): Promise<T> {
  return queryClient.fetchQuery({ queryKey, queryFn, staleTime });
}

export async function fetchBusinessQuery<T>(
  scope: string,
  queryFn: () => Promise<T>,
  params?: unknown,
  staleTime = 30_000
): Promise<T> {
  return fetchCached(
    ["thads", scope, params ?? {}],
    queryFn,
    staleTime
  );
}

export async function refreshBusinessData(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.all });
}

export function useBusinessMutation<TData, TVariables>(
  mutationFn: MutationFunction<TData, TVariables>
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
