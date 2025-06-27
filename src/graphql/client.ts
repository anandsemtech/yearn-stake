import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Get the subgraph URL from environment variables
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL;

if (!SUBGRAPH_URL) {
  console.warn("VITE_SUBGRAPH_URL is not defined in environment variables");
}

// Create HTTP link
const httpLink = createHttpLink({
  uri: SUBGRAPH_URL || "http://localhost:8000/subgraphs/name/your-subgraph",
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      // Add type policies here if needed for specific entities
      Query: {
        fields: {
          // Example: merge function for paginated queries
          // users: {
          //   keyArgs: false,
          //   merge(existing = [], incoming) {
          //     return [...existing, ...incoming];
          //   },
          // },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

export default apolloClient;
