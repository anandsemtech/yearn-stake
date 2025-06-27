import { ApolloProvider } from "@apollo/client";
import { ReactNode } from "react";

import { apolloClient } from "./client";

interface GraphQLProviderProps {
  children: ReactNode;
}

export const GraphQLProvider = ({ children }: GraphQLProviderProps) => {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};

export default GraphQLProvider;
