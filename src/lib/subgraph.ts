import { GraphQLClient } from "graphql-request";

export const SUBGRAPH_URL =
  (import.meta as any)?.env?.VITE_SUBGRAPH_URL ??
  "https://api.studio.thegraph.com/query/109223/yearntogether-testnet/v0.2.2";

export const subgraph = new GraphQLClient(SUBGRAPH_URL);
