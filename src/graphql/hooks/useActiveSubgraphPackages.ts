import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { subgraph, SUBGRAPH_URL } from "@/lib/subgraph";
import type {
  ActivePackagesQuery,
  ActivePackagesQueryVariables,
} from "@/graphql/__generated__/types";

const ACTIVE_PACKAGES = gql/* GraphQL */ `
  query ActivePackages($first: Int = 1000) {
    packages(
      first: $first
      orderBy: packageId
      orderDirection: asc
      where: { isActive: true }
    ) {
      id
      packageId
      durationInDays
      aprBps
      isActive
      minStakeAmount
      claimableInterval
      createdAt
    }
  }
`;

export type SubgraphPackage = {
  id: string;
  packageId: number;
  durationYears: number;
  aprPercent: number;
  minStakeAmountWei: string;
  claimableIntervalSec: string;
  createdAtSec: string;
  isActive: boolean;
};

export function useActiveSubgraphPackages() {
  const q = useQuery({
    queryKey: ["subgraph", SUBGRAPH_URL, "ActivePackages", "isActive"],
    queryFn: async () => {
      const data = await subgraph.request<
        ActivePackagesQuery,
        ActivePackagesQueryVariables
      >(ACTIVE_PACKAGES, { first: 1000 });

      const list: SubgraphPackage[] = (data.packages ?? []).map((p) => ({
        id: String(p.id),
        packageId: Number(p.packageId),
        durationYears: Number(p.durationInDays ?? 0) / 365,
        aprPercent: Number(p.aprBps ?? 0) / 100, // bps -> %
        minStakeAmountWei: String(p.minStakeAmount ?? "0"),
        claimableIntervalSec: String(p.claimableInterval ?? "0"),
        createdAtSec: String(p.createdAt ?? "0"),
        isActive: !!p.isActive,
      }));
      list.sort((a, b) => a.packageId - b.packageId);
      return list;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // 🔒 Return the stable shape the UI expects
  return {
    packages: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
