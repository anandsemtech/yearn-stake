import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";

import { baseContractConfig } from "../contract";

interface GoldenStarConfig {
  minReferral: number;
  timeWindow: number;
  rewardPercent: number;
  rewardDuration: number;
  rewardCapMultiplier: number;
}

export const useGoldenStarConfig = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...baseContractConfig(chainId),
        functionName: "isGoldenStar",
        args: [address as Address],
      },
      {
        ...baseContractConfig(chainId),
        functionName: "goldenStarConfig",
      },
    ],
  });

  const detail: {
    isGoldenStar: boolean;
    goldenStarConfig: GoldenStarConfig;
  } = useMemo(() => {
    if (!data)
      return {
        isGoldenStar: false,
        goldenStarConfig: {
          minReferral: 0,
          timeWindow: 0,
          rewardPercent: 0,
          rewardDuration: 0,
          rewardCapMultiplier: 0,
        },
      };
    const goldenStarConfig = data[1]?.result as unknown as Record<
      string,
      string
    >;
    return {
      isGoldenStar: data[0]?.result as unknown as boolean,
      goldenStarConfig: {
        minReferral: Number(goldenStarConfig.minReferral),
        timeWindow: Number(goldenStarConfig.timeWindow) / (1000 * 60 * 60 * 24), // days
        rewardPercent: Number(goldenStarConfig.rewardPercent) / 100,
        rewardDuration:
          Number(goldenStarConfig.rewardDuration) / (1000 * 60 * 60 * 24), // days
        rewardCapMultiplier: Number(goldenStarConfig.rewardCapMultiplier),
      },
    };
  }, [data]);

  return { detail, isLoading, error, refetch };
};
