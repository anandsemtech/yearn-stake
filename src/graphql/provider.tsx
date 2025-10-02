// src/graphql/provider.tsx
import React from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./client";

export const GraphQLProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
