import { gql, useQuery } from "@apollo/client";
import type { Address } from "viem";

export type StakeEntity = {
  id: string;              // "0x...-0"
  user: { id: string };
  packageId: number;
  totalStaked: string;     // wei string
  claimedAPR: string;
  withdrawnPrincipal: string;
  txHash: string;
  blockNumber: string;
  timestamp: string;       // seconds, string
};

// Kept as an alias to satisfy existing imports
export type PackageList = StakeEntity;

const USER_STAKES = gql`
  query UserStakes($user: Bytes!, $first: Int = 20) {
    stakes(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { user_: { id: $user } }
    ) {
      id
      user { id }
      packageId
      totalStaked
      claimedAPR
      withdrawnPrincipal
      txHash
      blockNumber
      timestamp
    }
  }
`;

export function useUserStakes(address?: Address) {
  const lower = address ? (address as string).toLowerCase() : undefined;

  const { data, loading, error, refetch, networkStatus } = useQuery<
    { stakes: StakeEntity[] },
    { user: string; first?: number }
  >(USER_STAKES, {
    variables: lower ? { user: lower, first: 20 } : undefined,
    skip: !lower,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  return {
    packageList: data?.stakes ?? [],
    isLoading: loading || !lower,
    error,
    refetch,
    networkStatus,
  };
}
