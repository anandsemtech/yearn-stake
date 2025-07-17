import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";

import { useGraphQLQuery } from "../hooks";
import { GET_USER_ALL_REWARDS } from "../queries";
import { UserAllRewardsData } from "../types";

export interface UseUserAllRewardsOptions {
  first?: number;
  skip?: number;
  skipQuery?: boolean;
}

export interface UseUserAllRewardsReturn {
  data: UserAllRewardsData | undefined;
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
  getGoldenStarRewardsByDate: (
    startDate: Date,
    endDate: Date
  ) => UserAllRewardsData["goldenStarRewardClaimeds"];
  getReferralRewardsByDate: (
    startDate: Date,
    endDate: Date
  ) => UserAllRewardsData["referralRewardDistributeds"];
  getStarRewardsByDate: (
    startDate: Date,
    endDate: Date
  ) => UserAllRewardsData["starRewardClaimeds"];
}

export const useUserAllRewards = (
  options: UseUserAllRewardsOptions = {}
): UseUserAllRewardsReturn => {
  const { address } = useAccount();
  const { first = 100, skip = 0, skipQuery = false } = options;

  const { data, loading, error, refetch } = useGraphQLQuery<UserAllRewardsData>(
    GET_USER_ALL_REWARDS,
    {
      variables: {
        user: address as Address,
        first,
        skip,
      },
      skip: !address || skipQuery,
    }
  );

  // Compute totals
  const totalGoldenStarRewardsClaimed =
    data?.goldenStarRewardClaimeds
      ?.reduce((sum, reward) => {
        return sum + Number(formatEther(reward.amount as unknown as bigint));
      }, 0)
      .toString() || "0";

  const totalGoldenStarRewardsDistributed =
    data?.goldenStarRewardDistributeds
      ?.reduce((sum, reward) => {
        return sum + Number(formatEther(reward.amount as unknown as bigint));
      }, 0)
      .toString() || "0";

  const totalReferralRewardsDistributed =
    data?.referralRewardDistributeds
      ?.reduce((sum, reward) => {
        return sum + Number(formatEther(reward.amount as unknown as bigint));
      }, 0)
      .toString() || "0";

  const totalReferralRewardsClaimed = {
    yAmount:
      data?.referralRewardsClaimeds
        ?.reduce((sum, reward) => {
          return sum + Number(formatEther(reward.yAmount as unknown as bigint));
        }, 0)
        .toString() || "0",
    sAmount:
      data?.referralRewardsClaimeds
        ?.reduce((sum, reward) => {
          return sum + Number(formatEther(reward.sAmount as unknown as bigint));
        }, 0)
        .toString() || "0",
    pAmount:
      data?.referralRewardsClaimeds
        ?.reduce((sum, reward) => {
          return sum + Number(formatEther(reward.pAmount as unknown as bigint));
        }, 0)
        .toString() || "0",
  };

  const totalStarRewardsClaimed =
    data?.starRewardClaimeds
      ?.reduce((sum, reward) => {
        return sum + Number(formatEther(reward.amount as unknown as bigint));
      }, 0)
      .toString() || "0";

  const totalStarRewardsDistributed =
    data?.starRewardDistributeds
      ?.reduce((sum, reward) => {
        return sum + Number(formatEther(reward.amount as unknown as bigint));
      }, 0)
      .toString() || "0";

  const totalRewardsEarnedByUser =
    Number(totalGoldenStarRewardsClaimed) +
    Number(totalGoldenStarRewardsDistributed) +
    Number(totalReferralRewardsDistributed) +
    Number(totalStarRewardsClaimed) +
    Number(totalStarRewardsDistributed) +
    Number(totalReferralRewardsClaimed.yAmount) +
    Number(totalReferralRewardsClaimed.sAmount) +
    Number(totalReferralRewardsClaimed.pAmount);

  // Helper functions for filtering by date
  const getGoldenStarRewardsByDate = (startDate: Date, endDate: Date) => {
    if (!data?.goldenStarRewardClaimeds) return [];

    const startTimestamp = Math.floor(startDate.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endDate.getTime() / 1000).toString();

    return data.goldenStarRewardClaimeds.filter((reward) => {
      const timestamp = parseInt(reward.blockTimestamp);
      return (
        timestamp >= parseInt(startTimestamp) &&
        timestamp <= parseInt(endTimestamp)
      );
    });
  };

  const getReferralRewardsByDate = (startDate: Date, endDate: Date) => {
    if (!data?.referralRewardDistributeds) return [];

    const startTimestamp = Math.floor(startDate.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endDate.getTime() / 1000).toString();

    return data.referralRewardDistributeds.filter((reward) => {
      const timestamp = parseInt(reward.blockTimestamp);
      return (
        timestamp >= parseInt(startTimestamp) &&
        timestamp <= parseInt(endTimestamp)
      );
    });
  };

  const getStarRewardsByDate = (startDate: Date, endDate: Date) => {
    if (!data?.starRewardClaimeds) return [];

    const startTimestamp = Math.floor(startDate.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endDate.getTime() / 1000).toString();

    return data.starRewardClaimeds.filter((reward) => {
      const timestamp = parseInt(reward.blockTimestamp);
      return (
        timestamp >= parseInt(startTimestamp) &&
        timestamp <= parseInt(endTimestamp)
      );
    });
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
