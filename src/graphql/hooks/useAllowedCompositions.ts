import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { subgraph, SUBGRAPH_URL } from "@/lib/subgraph";

const COMPOSITIONS = gql/* GraphQL */ `
  query AllowedCompositions($first: Int = 20) {
    compositions(first: $first, orderBy: index, orderDirection: asc) {
      id
      index
      yYearnPct
      sYearnPct
      pYearnPct
    }
  }
`;

export type CompositionRow = {
  id: string;
  index: number;
  yYearnPct: number;
  sYearnPct: number;
  pYearnPct: number;
};

export function useAllowedCompositions() {
  const q = useQuery({
    queryKey: ["subgraph", SUBGRAPH_URL, "compositions"],
    queryFn: async () => {
      const data = await subgraph.request<{ compositions: any[] }>(COMPOSITIONS, {
        first: 20,
      });

      const rows: CompositionRow[] = (data?.compositions ?? []).map((c) => ({
        id: String(c.id),
        index: Number(c.index ?? 0),
        yYearnPct: Number(c.yYearnPct ?? 0),
        sYearnPct: Number(c.sYearnPct ?? 0),
        pYearnPct: Number(c.pYearnPct ?? 0),
      }));

      // keep only rows that sum to 100, sort by index
      const clean = rows.filter(
        (r) => r.yYearnPct + r.sYearnPct + r.pYearnPct === 100
      );
      clean.sort((a, b) => a.index - b.index);
      return clean;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    compositions: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
