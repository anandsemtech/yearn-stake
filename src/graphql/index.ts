// Export Apollo Client
export { apolloClient } from "./client";

// Export Provider
export { GraphQLProvider } from "./provider";

// Export Hooks
export {
  useGraphQLQuery,
  useGraphQLMutation,
  useGraphQLLazyQuery,
  useGraphQLLoading,
} from "./hooks";

// Export Custom Hooks
export { useUserStakes } from "./useUserStakes";
export { useUserAllRewards } from "./useUserAllRewards";

// Export Types
export * from "./types";

// Export Queries and Mutations
export * from "./queries";
