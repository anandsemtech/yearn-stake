import { useAppKitAccount } from "@reown/appkit/react";
import { useCallback, useEffect, useMemo } from "react";
import { Address, erc20Abi, parseUnits } from "viem";
import { useChainId, useReadContract, useWriteContract } from "wagmi";

import { baseContractConfig } from "../contract";
import { useTokenAddresses } from "../ReadContract";

export function UseAllowanceAndApprove(
  preferredToken: "yYearn" | "sYearn" | "pYearn"
) {
  const { isConnected, address } = useAppKitAccount();
  const { yYearnAddress, sYearnAddress, pYearnAddress } = useTokenAddresses();

  const tokenAddress = useMemo(() => {
    return {
      yYearn: yYearnAddress,
      sYearn: sYearnAddress,
      pYearn: pYearnAddress,
    };
  }, [yYearnAddress, sYearnAddress, pYearnAddress]);

  const chainId = useChainId();
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress[preferredToken] as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as Address, baseContractConfig(chainId).address],
    query: {
      enabled: !!tokenAddress[preferredToken] && !!address && !!isConnected,
    },
  });

  const { isPending, isError, error, writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (isError) {
      console.error(error);
    }
  }, [isError, error]);

  const approve = useCallback(
    async (amount: bigint) => {
      try {
        await refetch();
        if (!isConnected || !address || !tokenAddress[preferredToken]) {
          console.debug("Not connected or address or token address");
          return;
        }
        if (allowance && allowance >= amount) {
          console.debug("Allowance already set");
          return true;
        }
        console.debug("Approving...");
        const amountToApprove = parseUnits(amount.toString(), 18);
        await writeContractAsync({
          address: tokenAddress[preferredToken] as Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [baseContractConfig(chainId).address, amountToApprove],
        });
        refetch();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [
      refetch,
      isConnected,
      address,
      tokenAddress,
      preferredToken,
      allowance,
      writeContractAsync,
      chainId,
    ]
  );

  return {
    approve,
    isPending,
    isError,
    error,
  };
}
