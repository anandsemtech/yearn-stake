import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { subgraph } from "@/lib/subgraph";

const COMPOSITIONS_QUERY = gql`
  query Compositions($first: Int = 10) {
    compositions(first: $first, orderBy: blockNumber, orderDirection: desc) {
      id
      index
      yYearnPct
      sYearnPct
      pYearnPct
      txHash
      blockNumber
      timestamp
    }
  }
`;

export type CompositionEntity = {
  id: string;
  index: number;
  yYearnPct: number;
  sYearnPct: number;
  pYearnPct: number;
  txHash: string;
  blockNumber: number;
  timestamp: number;
};

export function useCompositions(first = 50) {
  const query = useQuery({
    queryKey: ["compositions", first],
    queryFn: async () => {
      const data = await subgraph.request<{ compositions: any[] }>(
        COMPOSITIONS_QUERY,
        { first }
      );
      const rows: CompositionEntity[] = (data?.compositions ?? []).map((c) => ({
        id: String(c.id),
        index: Number(c.index),
        yYearnPct: Number(c.yYearnPct),
        sYearnPct: Number(c.sYearnPct),
        pYearnPct: Number(c.pYearnPct),
        txHash: String(c.txHash),
        blockNumber: Number(c.blockNumber),
        timestamp: Number(c.timestamp),
      }));

      // latest → earliest already, but keep a defensive sort by blockNumber DESC then index ASC
      rows.sort((a, b) =>
        b.blockNumber !== a.blockNumber
          ? b.blockNumber - a.blockNumber
          : a.index - b.index
      );

      const matrices: number[][] = rows.map((r) => [
        r.yYearnPct,
        r.sYearnPct,
        r.pYearnPct,
      ]);

      return { rows, matrices };
    },
  });

  return {
    compositionsRows: query.data?.rows ?? [],
    compositions: query.data?.matrices ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
