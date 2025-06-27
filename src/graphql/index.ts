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

// Export Queries and Mutations
export * from "./queries";
