// src/graphql/hooks/useGraphQL.ts
import { DocumentNode, OperationVariables, QueryHookOptions, useLazyQuery, useMutation, useQuery } from "@apollo/client";

export function useGraphQLQuery<TData = any, TVars extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVars>
) {
  return useQuery<TData, TVars>(query, options);
}

export function useGraphQLLazyQuery<TData = any, TVars extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVars>
) {
  return useLazyQuery<TData, TVars>(query, options);
}

export function useGraphQLMutation<TData = any, TVars extends OperationVariables = OperationVariables>(
  mutation: DocumentNode
) {
  return useMutation<TData, TVars>(mutation);
}

export function useGraphQLLoading(loadingFlags: Array<boolean | undefined>) {
  return loadingFlags.some(Boolean);
}
