import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { subgraph, SUBGRAPH_URL } from "@/lib/subgraph";
import type {
  ActivePackagesLegacyQuery,
  ActivePackagesLegacyQueryVariables,
} from "@/graphql/__generated__/types";

export type PackageList = {
  internal_id?: string;
  id: string;
  durationYears: number;
  totalStaked: string;       // from minStakeAmount (wei)
  apr: number;               // percent
  blockTimestamp: string;    // seconds
  claimableInterval: string; // seconds
  isActive: boolean;
  stakeIndex: string;        // packageId
  minStakeAmount?: string;
};

const ACTIVE_PACKAGES_LEGACY = gql/* GraphQL */ `
  query ActivePackagesLegacy($first: Int = 1000) {
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

function normalizeToPackageList(
  p: ActivePackagesLegacyQuery["packages"][number]
): PackageList {
  return {
    internal_id: String(p.id),
    id: String(p.packageId),
    durationYears: Number(p.durationInDays ?? 0) / 365,
    totalStaked: String(p.minStakeAmount ?? "0"),
    apr: Number(p.aprBps ?? 0) / 100, // bps -> %
    blockTimestamp: String(p.createdAt ?? "0"),
    claimableInterval: String(p.claimableInterval ?? "0"),
    isActive: !!p.isActive,
    stakeIndex: String(p.packageId),
    minStakeAmount: String(p.minStakeAmount ?? "0"),
  };
}

export function useUserStakes() {
  const q = useQuery({
    queryKey: ["subgraph", SUBGRAPH_URL, "ActivePackagesLegacy", "legacy-shape"],
    queryFn: async () => {
      const data = await subgraph.request<
        ActivePackagesLegacyQuery,
        ActivePackagesLegacyQueryVariables
      >(ACTIVE_PACKAGES_LEGACY, { first: 1000 });

      const list = (data.packages ?? []).map(normalizeToPackageList);
      list.sort((a, b) => Number(a.id) - Number(b.id));
      return { packageList: list };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    packageList: q.data?.packageList ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
