// src/graphql/index.ts

// --- Client / Provider ---
export { apolloClient } from "./client";
export { GraphQLProvider } from "./provider";

// --- Generic GraphQL hooks ---
export {
  useGraphQLQuery,
  useGraphQLMutation,
  useGraphQLLazyQuery,
  useGraphQLLoading,
} from "./hooks/useGraphQL";

// --- Custom hooks (subgraph-aware) ---
export { useUserStakes } from "./hooks/useUserStakes";
export { useUserAllRewards } from "./hooks/useUserAllRewards";

// --- Generated & local types ---
export * from "./types";

// --- Queries ---
export * from "./queries";

// --- Back-compat aliases for old imports ---
export { GET_PACKAGES as GET_PACKAGES_CREATED } from "./queries";
export { GET_REFERRER_ASSIGNMENTS, GET_USER_ALL_REWARDS } from "./queries";
