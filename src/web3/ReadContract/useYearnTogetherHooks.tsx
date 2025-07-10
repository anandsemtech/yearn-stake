import { useMemo } from "react";
import { Address } from "viem";
import { useChainId, useReadContract, useReadContracts } from "wagmi";

import { baseContractConfig } from "../contract";

// Types based on the ABI
export interface Package {
  id: number;
  durationYears: number;
  apr: number;
  monthlyPrincipalReturnPercent: number;
  monthlyUnstake: boolean;
  isActive: boolean;
  monthlyAPRClaimable: boolean;
  minStakeAmount: bigint | number;
}

export interface UserStake {
  totalStaked: bigint;
  claimedAPR: bigint;
  withdrawnPrincipal: bigint;
  startTime: number;
  lastClaimedAt: number;
  packageId: number;
}

export interface StarLevelTier {
  level: number;
  rewardPercent: number;
}

export interface ReferralRewardTier {
  startLevel: number;
  endLevel: number;
  rewardPercent: number;
  rewardToken: Address;
}

export interface GoldenStarConfig {
  minReferrals: number;
  timeWindow: number;
  rewardPercent: number;
  rewardDuration: number;
  rewardCapMultiplier: number;
}

export interface ReferralHistory {
  referee: Address;
  timestamp: bigint;
}

export interface UserStakeTokenAmount {
  token: Address;
  amount: bigint;
}

// Basic contract info hooks
export const useMaxReferralLevel = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "maxReferralLevel",
  });
};

export const useUpgradeInterfaceVersion = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "UPGRADE_INTERFACE_VERSION",
  });
};

export const useClaimableInterval = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "claimableInterval",
  });
};

export const useNextPackageId = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "nextPackageId",
  });
};

export const useContractOwner = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "owner",
  });
};

export const useContractPaused = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "paused",
  });
};

export const useProxiableUUID = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "proxiableUUID",
  });
};

export const useStarTierExecutor = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "starTierExecutor",
  });
};

// Token address hooks
export const useTokenAddresses = () => {
  const chainId = useChainId();

  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        ...baseContractConfig(chainId),
        functionName: "yYearn",
      },
      {
        ...baseContractConfig(chainId),
        functionName: "sYearn",
      },
      {
        ...baseContractConfig(chainId),
        functionName: "pYearn",
      },
    ],
  });

  return {
    yYearnAddress: data?.[0]?.result as Address,
    sYearnAddress: data?.[1]?.result as Address,
    pYearnAddress: data?.[2]?.result as Address,
    isLoading,
    error,
  };
};

// Package hooks
export const usePackage = (packageId: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "packages",
    args: [BigInt(packageId)],
  });

  const packageData = useMemo(() => {
    if (!data) return null;

    const result = data as [
      bigint,
      bigint,
      bigint,
      boolean,
      boolean,
      bigint,
      bigint,
      boolean
    ];
    return {
      id: Number(result[0]),
      durationYears: Number(result[1]),
      apr: Number(result[2]) / 100,
      monthlyUnstake: result[3],
      monthlyPrincipalReturnPercent: Number(result[6]) / 100,
      isActive: result[4],
      monthlyAPRClaimable: result[7],
      minStakeAmount: Number(result[5]),
    };
  }, [data]);

  return { data: packageData, isLoading, error, refetch };
};

// User-specific hooks
export const useUserStarLevel = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userStarLevel",
    args: [userAddress],
  });
};

export const useUserTotalStaked = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userTotalStaked",
    args: [userAddress],
  });
};

export const useUserStakeCounts = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userStakeCounts",
    args: [userAddress],
  });
};

export const useIsGoldenStar = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "isGoldenStar",
    args: [userAddress],
  });
};

export const useGoldenStarActivation = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "goldenStarActivation",
    args: [userAddress],
  });
};

export const useGoldenStarCap = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "getGoldenStarCap",
    args: [userAddress],
  });
};

// User stake hooks
export const useUserStake = (userAddress: Address, stakeIndex: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userStakes",
    args: [userAddress, BigInt(stakeIndex)],
  });

  const stakeData = useMemo(() => {
    if (!data) return null;

    const result = data as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean
    ];
    return {
      totalStaked: result[0],
      claimedAPR: result[1],
      withdrawnPrincipal: result[2],
      startTime: Number(result[3]),
      lastClaimedAt: Number(result[4]),
      packageId: Number(result[5]),
      isFullyUnstaked: result[6],
    } as UserStake;
  }, [data]);

  return { data: stakeData, isLoading, error, refetch };
};

export const useUserStakeTokenAmounts = (
  userAddress: Address,
  stakeIndex: number,
  tokenIndex: number
) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userStakeTokenAmounts",
    args: [userAddress, BigInt(stakeIndex), BigInt(tokenIndex)],
  });

  const tokenAmountData = useMemo(() => {
    if (!data) return null;

    const result = data as [Address, bigint];
    return {
      token: result[0],
      amount: result[1],
    } as UserStakeTokenAmount;
  }, [data]);

  return { data: tokenAmountData, isLoading, error, refetch };
};

export const useWithdrawnPerStake = (
  userAddress: Address,
  stakeIndex: number
) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "withdrawnPerStake",
    args: [userAddress, BigInt(stakeIndex)],
  });
};

export const useLastUnstakedAt = (userAddress: Address, stakeIndex: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "lastUnstakedAt",
    args: [userAddress, BigInt(stakeIndex)],
  });
};

// Star level hooks
export const useStarLevelTier = (tierIndex: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "starLevelTiers",
    args: [BigInt(tierIndex)],
  });

  const tierData = useMemo(() => {
    if (!data) return null;

    const result = data as [bigint, bigint];
    return {
      level: Number(result[0]),
      rewardPercent: Number(result[1]),
    } as StarLevelTier;
  }, [data]);

  return { data: tierData, isLoading, error, refetch };
};

export const useStarLevelActivation = (userAddress: Address, level: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "starLevelActivation",
    args: [userAddress, level],
  });
};

export const useStarLevelClaimed = (userAddress: Address, level: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "starLevelClaimed",
    args: [userAddress, level],
  });
};

export const useStarLevelEarnings = (userAddress: Address, level: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "starLevelEarnings",
    args: [userAddress, level],
  });
};

export const useStarLevelPercent = (userAddress: Address, level: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "getStarLevelPercent",
    args: [userAddress, level],
  });
};

export const useClaimableStarLevelRewards = (userAddress: Address) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "getPendingStarRewards",
    args: [userAddress],
  });

  const rewardsData = useMemo(() => {
    if (!data) return null;
    console.log({
      claimableStarLevelRewards: data,
    });
    const result = data as bigint[];
    return {
      totalClaimable: result[0],
      levelClaimables: result.slice(1),
    };
  }, [data]);

  return { data: rewardsData, isLoading, error, refetch };
};

export const usePendingGoldenStarRewards = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "getPendingGoldenStarRewards",
    args: [userAddress],
  });
};

// Golden star hooks
export const useGoldenStarConfig = () => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "goldenStarConfig",
  });

  const configData = useMemo(() => {
    if (!data) return null;
    const result = data as [bigint, bigint, bigint, bigint, bigint];
    return {
      minReferral: Number(result[0]),
      timeWindow: Number(result[1]) / (60 * 60 * 24), // days
      rewardPercent: Number(result[2]) / 100,
      rewardDuration: Number(result[3]) / (60 * 60 * 24), // days
      rewardCapMultiplier: Number(result[4]),
    };
  }, [data]);
  return { data: configData, isLoading, error, refetch };
};

// Referral hooks
export const useReferrerOf = (userAddress: Address) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "referrerOf",
    args: [userAddress],
  });
};

export const useReferralEarnings = (
  userAddress: Address,
  referrerAddress: Address
) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "referralEarnings",
    args: [userAddress, referrerAddress],
  });
};

export const useReferrals = (userAddress: Address, index: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "referrals",
    args: [userAddress, BigInt(index)],
  });
};

export const useReferralHistory = (userAddress: Address, index: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "referralHistory",
    args: [userAddress, BigInt(index)],
  });

  // const historyData = useMemo(() => {
  //   if (!data || data) return null;

  //   return {
  //     referee: data[0],
  //     timestamp: data[1],
  //   } as ReferralHistory;
  // }, [data]);

  return { data, isLoading, error, refetch };
};

export const useReferralRewardTier = (tierIndex: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "referralRewardTiers",
    args: [BigInt(tierIndex)],
  });

  const tierData = useMemo(() => {
    if (!data) return null;

    const result = data as [bigint, bigint, bigint, Address];
    return {
      startLevel: Number(result[0]),
      endLevel: Number(result[1]),
      rewardPercent: Number(result[2]),
      rewardToken: result[3],
    } as ReferralRewardTier;
  }, [data]);

  return { data: tierData, isLoading, error, refetch };
};

export const useUserRewardTiers = (userAddress: Address, tierIndex: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    ...baseContractConfig(chainId),
    functionName: "userRewardTiers",
    args: [userAddress, BigInt(tierIndex)],
  });

  const tierData = useMemo(() => {
    if (!data) return null;

    const result = data as [bigint, bigint, bigint, Address];
    return {
      startLevel: Number(result[0]),
      endLevel: Number(result[1]),
      rewardPercent: Number(result[2]),
      rewardToken: result[3],
    } as ReferralRewardTier;
  }, [data]);

  return { data: tierData, isLoading, error, refetch };
};

// Utility hooks
export const useNextClaimTime = (userAddress: Address, stakeIndex: number) => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "getNextClaimTime",
    args: [userAddress, BigInt(stakeIndex)],
  });
};

// Combined hooks for common use cases
export const useUserBasicInfo = (userAddress: Address) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...baseContractConfig(chainId),
        functionName: "userStarLevel",
        args: [userAddress],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "userTotalStaked",
        args: [userAddress],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "userStakeCounts",
        args: [userAddress],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "isGoldenStar",
        args: [userAddress],
      },
    ],
  });

  const userInfo = useMemo(() => {
    if (!data) return null;

    return {
      starLevel: (data[0]?.result as unknown as number) ?? 0,
      totalStaked: (data[1]?.result as unknown as bigint) ?? 0n,
      stakeCounts: (data[2]?.result as unknown as number) ?? 0,
      isGoldenStar: (data[3]?.result as unknown as boolean) ?? false,
    };
  }, [data]);

  return { data: userInfo, isLoading, error, refetch };
};

export const useUserStarLevelInfo = (userAddress: Address, level: number) => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...baseContractConfig(chainId),
        functionName: "starLevelActivation",
        args: [userAddress, level],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "starLevelClaimed",
        args: [userAddress, level],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "starLevelEarnings",
        args: [userAddress, level],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "getStarLevelPercent",
        args: [userAddress, level],
      },
    ],
  });

  const starLevelInfo = useMemo(() => {
    if (!data) return null;

    return {
      activation: (data[0]?.result as unknown as bigint) ?? 0n,
      claimed: (data[1]?.result as unknown as bigint) ?? 0n,
      earnings: (data[2]?.result as unknown as bigint) ?? 0n,
      percent: (data[3]?.result as unknown as bigint) ?? 0n,
    };
  }, [data]);

  return { data: starLevelInfo, isLoading, error, refetch };
};
