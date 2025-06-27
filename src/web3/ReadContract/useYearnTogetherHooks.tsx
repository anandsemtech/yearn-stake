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
  minStakeAmount: bigint;
  compositions: number[][];
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
    functionName: "MAX_REFERRAL_LEVEL",
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
export const useYYearnAddress = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "yYearn",
  });
};

export const useSYearnAddress = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "sYearn",
  });
};

export const usePYearnAddress = () => {
  const chainId = useChainId();
  return useReadContract({
    ...baseContractConfig(chainId),
    functionName: "pYearn",
  });
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

    return {
      id: Number(data[0]),
      durationYears: Number(data[1]),
      apr: Number(data[2]),
      monthlyPrincipalReturnPercent: Number(data[3]),
      monthlyUnstake: data[4],
      isActive: data[5],
      monthlyAPRClaimable: data[6],
      minStakeAmount: data[7],
      compositions: data[8] as number[][],
    } as Package;
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

    return {
      totalStaked: data[0],
      claimedAPR: data[1],
      withdrawnPrincipal: data[2],
      startTime: Number(data[3]),
      lastClaimedAt: Number(data[4]),
      packageId: Number(data[5]),
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

    return {
      token: data[0],
      amount: data[1],
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

    return {
      level: Number(data[0]),
      rewardPercent: Number(data[1]),
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
    functionName: "getClaimableStarLevelRewards",
    args: [userAddress],
  });

  const rewardsData = useMemo(() => {
    if (!data) return null;

    return {
      totalClaimable: data[0],
      levelClaimables: data[1] as bigint[],
    };
  }, [data]);

  return { data: rewardsData, isLoading, error, refetch };
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

    return {
      minReferrals: Number(data[0]),
      timeWindow: Number(data[1]),
      rewardPercent: Number(data[2]),
      rewardDuration: Number(data[3]),
      rewardCapMultiplier: Number(data[4]),
    } as GoldenStarConfig;
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

    return {
      startLevel: Number(data[0]),
      endLevel: Number(data[1]),
      rewardPercent: Number(data[2]),
      rewardToken: data[3],
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

    return {
      startLevel: Number(data[0]),
      endLevel: Number(data[1]),
      rewardPercent: Number(data[2]),
      rewardToken: data[3],
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
