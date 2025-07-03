import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { baseContractConfig, defaultGasLimit } from "../contract";
import { useTokenAddresses } from "../ReadContract";

import { UseAllowanceAndApprove } from "./useAllowanceAndApprove";

export function useApproveAndProcess() {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const result = useWaitForTransactionReceipt({ hash: txHash ?? undefined });
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const { yYearnAddress, sYearnAddress, pYearnAddress } = useTokenAddresses();
  const { approve, isPending: isApproving } = UseAllowanceAndApprove("yYearn");
  const { isPending, isError, error, failureReason, writeContractAsync } =
    useWriteContract();

  useEffect(() => {
    if (result.isSuccess) {
      toast.success("Staking successful");
    } else if (result.isError) {
      toast.error(result.error?.message);
    }
  }, [result.isPending, result.isSuccess, result.isError, result.error]);

  const stake = useCallback(
    async (args: {
      packageId: number;
      amounts: string[];
      referrer: string;
    }) => {
      try {
        const { packageId, amounts, referrer } = args;
        const amountBigInt = parseUnits(amounts[0], 18);

        await approve(amountBigInt);

        const result = await publicClient?.estimateContractGas({
          account: address,
          ...baseContractConfig(chainId),
          functionName: "stake",
          args: [
            packageId,
            [yYearnAddress, sYearnAddress, pYearnAddress],
            [amounts[0], 0, 0],
            referrer,
          ],
        });
        const estimatedGas = result ?? defaultGasLimit;
        const tx = await writeContractAsync({
          account: address,
          ...baseContractConfig(chainId),
          functionName: "stake",
          args: [
            packageId,
            [yYearnAddress, sYearnAddress, pYearnAddress],
            [amountBigInt, 0, 0],
            referrer,
          ],
          gas: estimatedGas,
        });
        setTxHash(tx);
      } catch (error) {
        console.error(error);
      }
    },
    [approve, publicClient, address, chainId, writeContractAsync]
  );

  return {
    stake,
    isStakePending: isApproving || isPending || result.isFetching,
    isStakeError: isError || result.isError,
    stakeError: error || result.error,
    stakeFailureReason: failureReason || result.failureReason,
    isStakeSuccess: result.isSuccess,
  };
}
