import {
  useQuery,
  useMutation,
  useLazyQuery,
  DocumentNode,
  QueryHookOptions,
  MutationHookOptions,
  LazyQueryHookOptions,
  OperationVariables,
} from "@apollo/client";

// Custom hook for queries with better error handling
export const useGraphQLQuery = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
) => {
  return useQuery<TData, TVariables>(query, {
    errorPolicy: "all",
    ...options,
  });
};

// Custom hook for mutations with better error handling
export const useGraphQLMutation = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  mutation: DocumentNode,
  options?: MutationHookOptions<TData, TVariables>
) => {
  return useMutation<TData, TVariables>(mutation, {
    errorPolicy: "all",
    ...options,
  });
};

// Custom hook for lazy queries
export const useGraphQLLazyQuery = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<TData, TVariables>
) => {
  return useLazyQuery<TData, TVariables>(query, {
    errorPolicy: "all",
    ...options,
  });
};

// Utility hook for handling loading states
export const useGraphQLLoading = (loading: boolean, error?: unknown) => {
  return {
    isLoading: loading,
    hasError: !!error,
    error,
  };
};
