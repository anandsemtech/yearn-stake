import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { Address, erc20Abi, formatUnits, parseEther } from "viem";
import {
  useChainId,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";

import { useWallet } from "../../contexts/hooks/useWallet";
import { customError } from "../../utils/customError";
import { baseContractConfig, ASSET_ADDRESS, BASE_CONTRACT } from "../contract";

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
  const actualTokenAddress = tokenAddress || getTokenAddress(chainId);
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
      const actualTokenAddress =
        tokenAddress || getTokenAddress(chainId, tokenAddress);
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
  const {
    data: hash,
    isPending,
    error,
    isError,
    writeContract,
  } = useWriteContract();
  const {
    isSuccess,
    isFetching,
    isError: isReceiptError,
    error: receiptError,
  } = useTransactionReceipt(hash);

  const publicClient = usePublicClient();

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <>
          Unstake successful{" "}
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {hash}
          </a>
        </>
      );
    }
    if (receiptError || isReceiptError || isError || error) {
      if (receiptError || isReceiptError) {
        toast.error(
          <>
            Unstake failed{" "}
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {hash}
            </a>
          </>
        );
      } else {
        toast.error(`Unstake failed `);
      }
    }
  }, [isSuccess, error, receiptError, isReceiptError, isError, hash]);

  const unstake = useCallback(
    async (stakeIndex: number) => {
      try {
        const gasPrice = await publicClient?.estimateContractGas({
          ...baseContractConfig(chainId),
          functionName: "unstake",
          args: [BigInt(stakeIndex)],
        });
        return writeContract({
          ...baseContractConfig(chainId),
          functionName: "unstake",
          args: [BigInt(stakeIndex)],
          gasPrice: gasPrice,
        });
      } catch (e) {
        customError(e as Error);
      }
    },
    [publicClient, chainId, writeContract]
  );

  return {
    unstake,
    hash,
    isPending: isPending || isFetching,
    isSuccess,
    error,
  };
};

// Claim APR function
export const useClaimAPR = () => {
  const chainId = useChainId();

  const {
    data: hash,
    isPending,
    error,
    isError,
    writeContract,
  } = useWriteContract();
  const {
    isSuccess,
    isFetching,
    isError: isReceiptError,
    error: receiptError,
  } = useTransactionReceipt(hash);

  const publicClient = usePublicClient();

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        <>
          Claim APR successful{" "}
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {hash}
          </a>
        </>
      );
    }
    if (receiptError || isReceiptError || isError || error) {
      if (receiptError || isReceiptError) {
        toast.error(
          <>
            Claim APR failed{" "}
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Click to view on BaseScan
            </a>
          </>
        );
      } else {
        toast.error(`Claim APR failed `);
      }
    }
  }, [isSuccess, error, hash, receiptError, isError, isReceiptError]);

  const claimAPR = useCallback(
    async (stakeIndex: number) => {
      try {
        const gasPrice = await publicClient?.estimateContractGas({
          ...baseContractConfig(chainId),
          functionName: "claimAPR",
          args: [BigInt(stakeIndex)],
        });
        return writeContract({
          ...baseContractConfig(chainId),
          functionName: "claimAPR",
          args: [BigInt(stakeIndex)],
          gasPrice: gasPrice,
        });
      } catch (e) {
        customError(e as Error);
      }
    },
    [publicClient, chainId, writeContract]
  );

  return {
    claimAPR,
    hash,
    isPending: isPending || isFetching,
    isSuccess,
    error,
  };
};

// Claim Referral Rewards function
export const useClaimReferralRewards = () => {
  const chainId = useChainId();

  const {
    data: hash,
    isPending,
    error,
    writeContractAsync,
    isSuccess,
  } = useWriteContract();

  const claimReferralRewards = useCallback(async () => {
    return await writeContractAsync({
      ...baseContractConfig(chainId),
      functionName: "claimReferralRewards",
    });
  }, [writeContractAsync, chainId]);

  return {
    claimReferralRewards,
    hash,
    isSuccess,
    isPending,
    error,
  };
};

// Claim Golden Star Rewards function
export const useClaimGoldenStarRewards = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isSuccess } = useTransactionReceipt(hash);
  const claimGoldenStarRewards = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "claimGoldenStarRewards",
    });
  }, [writeContract, chainId]);

  return {
    claimGoldenStarRewards,
    hash,
    isPending,
    isSuccess,
    error,
  };
};

// Claim Star Rewards function
export const useClaimStarLevelRewards = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isSuccess } = useTransactionReceipt(hash);
  const claimStarLevelRewards = useCallback(async () => {
    return writeContract({
      ...baseContractConfig(chainId),
      functionName: "claimStarLevelRewards",
    });
  }, [writeContract, chainId]);

  return {
    claimStarLevelRewards,
    hash,
    isPending,
    error,
    isSuccess,
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

// Set Max Referral Level function
export const useSetMaxReferralLevel = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setMaxReferralLevel = useCallback(
    async (level: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setMaxReferralLevel",
        args: [level],
      });
    },
    [writeContract, chainId]
  );

  return {
    setMaxReferralLevel,
    hash,
    isPending,
    error,
  };
};

// Set Max Star Level function
export const useSetMaxStarLevel = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const setMaxStarLevel = useCallback(
    async (maxStarLevel: number) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "setMaxStarLevel",
        args: [maxStarLevel],
      });
    },
    [writeContract, chainId]
  );

  return {
    setMaxStarLevel,
    hash,
    isPending,
    error,
  };
};

// Add Valid Composition function
export const useAddValidComposition = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const addValidComposition = useCallback(
    async (composition: number[]) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "addValidComposition",
        args: [composition],
      });
    },
    [writeContract, chainId]
  );

  return {
    addValidComposition,
    hash,
    isPending,
    error,
  };
};

// Upgrade To function
export const useUpgradeTo = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const upgradeTo = useCallback(
    async (newImplementation: Address) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "upgradeTo",
        args: [newImplementation],
      });
    },
    [writeContract, chainId]
  );

  return {
    upgradeTo,
    hash,
    isPending,
    error,
  };
};

// Initialize function
export const useInitialize = () => {
  const chainId = useChainId();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const initialize = useCallback(
    async (
      yYearn: Address,
      sYearn: Address,
      pYearn: Address,
      goldenStarConfig: {
        minReferrals: number;
        timeWindow: number;
        rewardPercent: number;
        rewardDuration: number;
        rewardCapMultiplier: number;
      },
      maxReferralLevel: number
    ) => {
      return writeContract({
        ...baseContractConfig(chainId),
        functionName: "initialize",
        args: [yYearn, sYearn, pYearn, goldenStarConfig, maxReferralLevel],
      });
    },
    [writeContract, chainId]
  );

  return {
    initialize,
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
  const {
    tokenAddresses: { yYearnAddress },
  } = useWallet();
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: allowance } = useERC20Allowance(
    yYearnAddress,
    address,
    BASE_CONTRACT[chainId as keyof typeof BASE_CONTRACT].address
  );

  const stakeWithApproval = useCallback(
    async (
      packageId: number,
      tokens: Address[],
      amounts: bigint[],
      referrer: Address
    ) => {
      // First approve the contract to spend tokens
      const formattedAmount = parseEther(amounts[0].toString());
      const allowanceAmount = formatUnits(allowance || 0n, 18);
      if (Number(allowanceAmount) < Number(amounts[0])) {
        await approve(
          formattedAmount,
          yYearnAddress,
          BASE_CONTRACT[chainId as keyof typeof BASE_CONTRACT].address
        );
      }

      // Then stake
      return await stake(packageId, tokens, amounts, referrer);
    },
    [allowance, stake, approve, yYearnAddress, chainId]
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
