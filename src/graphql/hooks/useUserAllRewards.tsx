// src/graphql/hooks/useUserAllRewards.tsx
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useGraphQLQuery } from "../hooks/useGraphQL";
import { GET_USER_ALL_REWARDS } from "../queries";

// Keep your public API the same
export interface UseUserAllRewardsOptions {
  first?: number;
  skip?: number;
  skipQuery?: boolean;
}

export interface UseUserAllRewardsReturn {
  data: any | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  // Computed totals for easy access
  totalGoldenStarRewardsClaimed: string;
  totalGoldenStarRewardsDistributed: string;
  totalReferralRewardsDistributed: string;
  totalReferralRewardsClaimed: {
    yAmount: string;
    sAmount: string;
    pAmount: string;
  };
  totalStarRewardsClaimed: string;
  totalRewardsEarnedByUser: number;
  // Helper functions
  getGoldenStarRewardsByDate: (startDate: Date, endDate: Date) => any[];
  getReferralRewardsByDate: (startDate: Date, endDate: Date) => any[];
  getStarRewardsByDate: (startDate: Date, endDate: Date) => any[];
}

// safe BigInt from subgraph strings
const toWei = (v: any) => {
  try {
    if (typeof v === "bigint") return v;
    if (typeof v === "number") return BigInt(Math.trunc(v));
    if (typeof v === "string") return BigInt(v);
  } catch {}
  return 0n;
};

export const useUserAllRewards = (
  options: UseUserAllRewardsOptions = {}
): UseUserAllRewardsReturn => {
  const { address } = useAccount();
  const { first = 100, skip = 0, skipQuery = false } = options;

  const userId = (address ?? "").toLowerCase();

  const { data, loading, error, refetch } = useGraphQLQuery<any>(
    GET_USER_ALL_REWARDS,
    {
      variables: {
        user: userId,
        first,
        skip,
      },
      skip: !userId || skipQuery,
      fetchPolicy: "cache-and-network",
    }
  );

  // --- Normalize result arrays (support old & new names) ---
  const goldenStarClaimed =
    data?.goldenStarRewardClaimeds ?? data?.goldenStarPayouts ?? [];

  const starClaimed =
    data?.starRewardClaimeds ?? data?.starRewardPayouts ?? [];

  const referralClaimed =
    data?.referralRewardsClaimeds ?? []; // old schema only

  const referralDistributed =
    data?.referralRewardDistributeds ?? data?.referralEarnings ?? [];

  const goldenStarDistributed = data?.goldenStarRewardDistributeds ?? []; // often not present in new schema
  const starDistributed = data?.starRewardDistributeds ?? []; // often not present in new schema

  // helpers
  const sumEther = (arr: any[], field = "amount") =>
    arr
      .reduce((sum, r) => sum + Number(formatEther(toWei(r?.[field]))), 0)
      .toString();

  // --- Totals (fall back to 0 where the new schema dropped a stream) ---
  const totalGoldenStarRewardsClaimed = sumEther(goldenStarClaimed, "amount");
  const totalGoldenStarRewardsDistributed = sumEther(
    goldenStarDistributed,
    "amount"
  );

  const totalReferralRewardsDistributed = sumEther(
    referralDistributed,
    // new schema typically uses `amount`
    "amount"
  );

  // In the old schema, claims split Y/S/P amounts. In the new schema we don’t have that.
  // Be defensive: if the fields exist, sum them; else return "0".
  const totalReferralRewardsClaimed = {
    yAmount: referralClaimed.length
      ? referralClaimed
          .reduce((sum: number, r: any) => sum + Number(formatEther(toWei(r?.yAmount))), 0)
          .toString()
      : "0",
    sAmount: referralClaimed.length
      ? referralClaimed
          .reduce((sum: number, r: any) => sum + Number(formatEther(toWei(r?.sAmount))), 0)
          .toString()
      : "0",
    pAmount: referralClaimed.length
      ? referralClaimed
          .reduce((sum: number, r: any) => sum + Number(formatEther(toWei(r?.pAmount))), 0)
          .toString()
      : "0",
  };

  const totalStarRewardsClaimed = sumEther(starClaimed, "amount");
  const totalStarRewardsDistributed = sumEther(starDistributed, "amount");

  const totalRewardsEarnedByUser =
    Number(totalGoldenStarRewardsClaimed) +
    Number(totalGoldenStarRewardsDistributed) +
    Number(totalReferralRewardsDistributed) +
    Number(totalStarRewardsClaimed) +
    Number(totalStarRewardsDistributed) +
    Number(totalReferralRewardsClaimed.yAmount) +
    Number(totalReferralRewardsClaimed.sAmount) +
    Number(totalReferralRewardsClaimed.pAmount);

  // --- Date range filters (use `timestamp`, fallback to `blockTimestamp`) ---
  const inRange = (tsSec: string | number | undefined, start: number, end: number) => {
    if (tsSec == null) return false;
    const n =
      typeof tsSec === "string"
        ? Number(tsSec)
        : typeof tsSec === "number"
        ? tsSec
        : Number(tsSec);
    return n >= start && n <= end;
  };

  const getGoldenStarRewardsByDate = (startDate: Date, endDate: Date) => {
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const arr = goldenStarClaimed;
    return arr.filter(
      (r: any) =>
        inRange(r?.timestamp, start, end) ||
        inRange(r?.blockTimestamp, start, end)
    );
  };

  const getReferralRewardsByDate = (startDate: Date, endDate: Date) => {
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const arr = referralDistributed;
    return arr.filter(
      (r: any) =>
        inRange(r?.timestamp, start, end) ||
        inRange(r?.blockTimestamp, start, end)
    );
  };

  const getStarRewardsByDate = (startDate: Date, endDate: Date) => {
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const arr = starClaimed;
    return arr.filter(
      (r: any) =>
        inRange(r?.timestamp, start, end) ||
        inRange(r?.blockTimestamp, start, end)
    );
  };

  return {
    data,
    loading,
    error,
    refetch,
    totalGoldenStarRewardsClaimed,
    totalGoldenStarRewardsDistributed,
    totalReferralRewardsDistributed,
    totalReferralRewardsClaimed,
    totalStarRewardsClaimed,
    totalRewardsEarnedByUser,
    getGoldenStarRewardsByDate,
    getReferralRewardsByDate,
    getStarRewardsByDate,
  };
};
