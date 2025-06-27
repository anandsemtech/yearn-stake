import { useMemo } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";

import { baseContractConfig, ercConfig } from "../contract";

export const useTokenDetails = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...ercConfig(chainId),
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        ...ercConfig(chainId),
        functionName: "allowance",
        args: [address as Address, baseContractConfig(chainId).address],
      },
    ],
  });

  const detail = useMemo(() => {
    if (!data) return { balance: 0n, allowance: 0n };
    return {
      balance: data[0]?.result
        ? formatUnits(data[0]?.result as bigint, 18)
        : 0n,
      allowance: data[1]?.result
        ? formatUnits(data[1]?.result as bigint, 18)
        : 0n,
    };
  }, [data]);

  return { detail, isLoading, error, refetch };
};
