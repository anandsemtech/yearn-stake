// hooks/useAllowedCompositionsSubgraph.ts
import { useQuery, gql } from "@apollo/client";

const COMPOSITIONS = gql`
  query Compositions {
    compositions(orderBy: index, orderDirection: asc) {
      index
      yYearnPct
      sYearnPct
      pYearnPct
    }
  }
`;

export function useAllowedCompositionsFromSubgraph() {
  const { data, loading, error } = useQuery(COMPOSITIONS, {
    fetchPolicy: "cache-and-network", // or "network-only" if you prefer
  });
  const compositions =
    data?.compositions?.map((c: any) => ({
      yYearnPct: Number(c.yYearnPct),
      sYearnPct: Number(c.sYearnPct),
      pYearnPct: Number(c.pYearnPct),
    })) ?? [];
  return { compositions, isLoading: loading, error };
}
