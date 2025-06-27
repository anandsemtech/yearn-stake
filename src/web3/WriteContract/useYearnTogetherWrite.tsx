import { useCallback } from "react";
import { Address, erc20Abi } from "viem";
import {
  useChainId,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { baseContractConfig, ASSET_ADDRESS } from "../contract";

// Utility function to get token address with fallback
const getTokenAddress = (chainId: number, tokenAddress?: Address): Address => {
  if (tokenAddress) return tokenAddress;

  const assetConfig = ASSET_ADDRESS[chainId as keyof typeof ASSET_ADDRESS];
  return (
    assetConfig?.address ||
    ("0x0000000000000000000000000000000000000000" as Address)
  );
};

// Utility function to get contract address
const getContractAddress = (chainId: number): Address => {
  const contractConfig = baseContractConfig(chainId);
  return (
    contractConfig?.address ||
    ("0x0000000000000000000000000000000000000000" as Address)
  );
};

// ERC20 Allowance and Approve Hooks
export const useERC20Allowance = (
  tokenAddress?: Address,
  ownerAddress?: Address,
  spenderAddress?: Address
) => {
  const chainId = useChainId();
  const actualTokenAddress = getTokenAddress(chainId, tokenAddress);
  const actualSpenderAddress = spenderAddress || getContractAddress(chainId);

  return useReadContract({
    address: actualTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      ownerAddress || ("0x0000000000000000000000000000000000000000" as Address),
      actualSpenderAddress,
    ],
  });
};

export const useERC20Approve = () => {
  const chainId = useChainId();
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const approve = useCallback(
    async (
      amount: bigint,
      tokenAddress?: Address,
      spenderAddress?: Address
    ) => {
      const actualTokenAddress = getTokenAddress(chainId, tokenAddress);
      const actualSpenderAddress =
        spenderAddress || getContractAddress(chainId);

      return writeContract({
        address: actualTokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [actualSpenderAddress, amount],
      });
    },
    [writeContract, chainId]
  );

  return {
    approve,
    hash,
    isPending,
    error,
  };
};

export const useERC20ApproveWithSimulation = () => {
  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const approveWithSimulation = useCallback(
    async (
      amount: bigint,
      tokenAddress?: Address,
      spenderAddress?: Address
    ) => {
      // Note: Simulation should be done before calling this function
      // This is a simplified version without inline simulation
      return writeContract({
        address:
          tokenAddress ||
          ("0x0000000000000000000000000000000000000000" as Address),
        abi: erc20Abi,
        functionName: "approve",
        args: [
          spenderAddress ||
            ("0x0000000000000000000000000000000000000000" as Address),
          amount,
        ],
      });
    },
    [writeContract]
  );

  return {
    approveWithSimulation,
    hash,
    isPending,
    error,
  };
};

// YearnTogether Write Contract Hooks

// Stake function
export const useStake = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const stake = useCallback(
    async (
      packageId: number,
      tokens: Address[],
      amounts: bigint[],
      referrer: Address
    ) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "stake",
        args: [packageId, tokens, amounts, referrer],
      });
    },
    [writeContract, chainId]
  );

  return {
    stake,
    hash,
    isPending,
    error,
  };
};

// Unstake function
export const useUnstake = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const unstake = useCallback(
    async (stakeIndex: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "unstake",
        args: [BigInt(stakeIndex)],
      });
    },
    [writeContract, chainId]
  );

  return {
    unstake,
    hash,
    isPending,
    error,
  };
};

// Claim APR function
export const useClaimAPR = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const claimAPR = useCallback(
    async (stakeIndex: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "claimAPR",
        args: [BigInt(stakeIndex)],
      });
    },
    [writeContract, chainId]
  );

  return {
    claimAPR,
    hash,
    isPending,
    error,
  };
};

// Claim Star Reward function
export const useClaimStarReward = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const claimStarReward = useCallback(
    async (level: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "claimStarReward",
        args: [level],
      });
    },
    [writeContract, chainId]
  );

  return {
    claimStarReward,
    hash,
    isPending,
    error,
  };
};

// Claim All Star Rewards function
export const useClaimAllStarRewards = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const claimAllStarRewards = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "claimAllStarRewards",
    });
  }, [writeContract, chainId]);

  return {
    claimAllStarRewards,
    hash,
    isPending,
    error,
  };
};

// Claim Referral Rewards function
export const useClaimReferralRewards = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const claimReferralRewards = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "claimReferralRewards",
    });
  }, [writeContract, chainId]);

  return {
    claimReferralRewards,
    hash,
    isPending,
    error,
  };
};

// Activate Golden Star function
export const useActivateGoldenStar = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const activateGoldenStar = useCallback(
    async (userAddress: Address) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "activateGoldenStar",
        args: [userAddress],
      });
    },
    [writeContract, chainId]
  );

  return {
    activateGoldenStar,
    hash,
    isPending,
    error,
  };
};

// Downgrade Golden Star function
export const useDowngradeGoldenStar = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const downgradeGoldenStar = useCallback(
    async (userAddress: Address) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "downgradeGoldenStar",
        args: [userAddress],
      });
    },
    [writeContract, chainId]
  );

  return {
    downgradeGoldenStar,
    hash,
    isPending,
    error,
  };
};

// Emergency Withdraw function
export const useEmergencyWithdraw = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const emergencyWithdraw = useCallback(
    async (stakeIndex: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "emergencyWithdraw",
        args: [BigInt(stakeIndex)],
      });
    },
    [writeContract, chainId]
  );

  return {
    emergencyWithdraw,
    hash,
    isPending,
    error,
  };
};

// Admin Functions (Owner Only)

// Create Package function
export const useCreatePackage = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const createPackage = useCallback(
    async (
      durationYears: number,
      apr: number,
      monthlyUnstake: boolean,
      isActive: boolean,
      minStakeAmount: bigint,
      compositions: number[][],
      monthlyPrincipalReturnPercent: number,
      monthlyAPRClaimable: boolean
    ) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "createPackage",
        args: [
          durationYears,
          apr,
          monthlyUnstake,
          isActive,
          minStakeAmount,
          compositions,
          monthlyPrincipalReturnPercent,
          monthlyAPRClaimable,
        ],
      });
    },
    [writeContract, chainId]
  );

  return {
    createPackage,
    hash,
    isPending,
    error,
  };
};

// Update Package function
export const useUpdatePackage = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const updatePackage = useCallback(
    async (
      packageId: number,
      packageData: {
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
    ) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "updatePackage",
        args: [packageId, packageData],
      });
    },
    [writeContract, chainId]
  );

  return {
    updatePackage,
    hash,
    isPending,
    error,
  };
};

// Set Star Level Tiers function
export const useSetStarLevelTiers = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setStarLevelTiers = useCallback(
    async (tiers: { level: number; rewardPercent: number }[]) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setStarLevelTiers",
        args: [tiers],
      });
    },
    [writeContract, chainId]
  );

  return {
    setStarLevelTiers,
    hash,
    isPending,
    error,
  };
};

// Set Referral Reward Tiers function
export const useSetReferralRewardTiers = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setReferralRewardTiers = useCallback(
    async (
      tiers: {
        startLevel: number;
        endLevel: number;
        rewardPercent: number;
        rewardToken: Address;
      }[]
    ) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setReferralRewardTiers",
        args: [tiers],
      });
    },
    [writeContract, chainId]
  );

  return {
    setReferralRewardTiers,
    hash,
    isPending,
    error,
  };
};

// Set Golden Star Config function
export const useSetGoldenStarConfig = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setGoldenStarConfig = useCallback(
    async (config: {
      minReferrals: number;
      timeWindow: number;
      rewardPercent: number;
      rewardDuration: number;
      rewardCapMultiplier: number;
    }) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setGoldenStarConfig",
        args: [config],
      });
    },
    [writeContract, chainId]
  );

  return {
    setGoldenStarConfig,
    hash,
    isPending,
    error,
  };
};

// Set User Star Level function
export const useSetUserStarLevel = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setUserStarLevel = useCallback(
    async (userAddress: Address, level: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setUserStarLevel",
        args: [userAddress, level],
      });
    },
    [writeContract, chainId]
  );

  return {
    setUserStarLevel,
    hash,
    isPending,
    error,
  };
};

// Set Star Tier Executor function
export const useSetStarTierExecutor = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setStarTierExecutor = useCallback(
    async (executorAddress: Address) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setStarTierExecutor",
        args: [executorAddress],
      });
    },
    [writeContract, chainId]
  );

  return {
    setStarTierExecutor,
    hash,
    isPending,
    error,
  };
};

// Set Claimable Interval function
export const useSetClaimableInterval = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setClaimableInterval = useCallback(
    async (intervalInSeconds: bigint) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setClaimableInterval",
        args: [intervalInSeconds],
      });
    },
    [writeContract, chainId]
  );

  return {
    setClaimableInterval,
    hash,
    isPending,
    error,
  };
};

// Pause/Unpause functions
export const usePause = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const pause = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "pause",
    });
  }, [writeContract, chainId]);

  return {
    pause,
    hash,
    isPending,
    error,
  };
};

export const useUnpause = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const unpause = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "unpause",
    });
  }, [writeContract, chainId]);

  return {
    unpause,
    hash,
    isPending,
    error,
  };
};

// Ownership functions
export const useTransferOwnership = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const transferOwnership = useCallback(
    async (newOwner: Address) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },
    [writeContract, chainId]
  );

  return {
    transferOwnership,
    hash,
    isPending,
    error,
  };
};

export const useRenounceOwnership = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const renounceOwnership = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "renounceOwnership",
    });
  }, [writeContract, chainId]);

  return {
    renounceOwnership,
    hash,
    isPending,
    error,
  };
};

// Upgrade function
export const useUpgradeToAndCall = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const upgradeToAndCall = useCallback(
    async (newImplementation: Address, data: string) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "upgradeToAndCall",
        args: [newImplementation, data as `0x${string}`],
      });
    },
    [writeContract, chainId]
  );

  return {
    upgradeToAndCall,
    hash,
    isPending,
    error,
  };
};

// Transaction Receipt Hooks
export const useTransactionReceipt = (hash: `0x${string}` | undefined) => {
  return useWaitForTransactionReceipt({
    hash,
  });
};

// Combined hooks for common operations
export const useStakeWithApproval = () => {
  const {
    approve,
    isPending: isApprovePending,
    error: approveError,
  } = useERC20Approve();
  const { stake, isPending: isStakePending, error: stakeError } = useStake();

  const stakeWithApproval = useCallback(
    async (
      tokenAddress: Address,
      packageId: number,
      tokens: Address[],
      amounts: bigint[],
      referrer: Address,
      contractAddress: Address
    ) => {
      // First approve the contract to spend tokens
      await approve(amounts[0], tokenAddress, contractAddress);

      // Then stake
      return await stake(packageId, tokens, amounts, referrer);
    },
    [approve, stake]
  );

  return {
    stakeWithApproval,
    isPending: isApprovePending || isStakePending,
    error: approveError || stakeError,
  };
};

// Utility hooks to get addresses
export const useTokenAddress = (tokenAddress?: Address) => {
  const chainId = useChainId();
  return getTokenAddress(chainId, tokenAddress);
};

export const useContractAddress = () => {
  const chainId = useChainId();
  return getContractAddress(chainId);
};

// Hook to check if approval is needed
export const useCheckApprovalNeeded = (
  requiredAmount: bigint,
  tokenAddress?: Address,
  ownerAddress?: Address,
  spenderAddress?: Address
) => {
  const { data: allowance, isLoading } = useERC20Allowance(
    tokenAddress,
    ownerAddress,
    spenderAddress
  );

  const needsApproval = allowance !== undefined && allowance < requiredAmount;

  return {
    allowance,
    needsApproval,
    isLoading,
  };
};
