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

import { useMultiTokenApprove } from "./useMultiTokenApprove";

export function useApproveAndProcess() {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const result = useWaitForTransactionReceipt({ hash: txHash ?? undefined });
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const { yYearnAddress, sYearnAddress, pYearnAddress } = useTokenAddresses();
  const {
    multiTokenApprove,
    allConfirmed,
    anyLoading: isApproving,
  } = useMultiTokenApprove();
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
        const amountBigInt = amounts.map((amount) => parseUnits(amount, 18));

        // Prepare token list for multi-token approval
        const tokenList = [
          {
            address: yYearnAddress as `0x${string}`,
            amount: amountBigInt[0],
          },
          {
            address: sYearnAddress as `0x${string}`,
            amount: amountBigInt[1],
          },
          {
            address: pYearnAddress as `0x${string}`,
            amount: amountBigInt[2],
          },
        ];

        // Wait for all token approvals to be confirmed
        await multiTokenApprove(tokenList);

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
        toast.error(error as string);
        console.error(error);
      }
    },
    [
      multiTokenApprove,
      publicClient,
      address,
      chainId,
      yYearnAddress,
      sYearnAddress,
      pYearnAddress,
      writeContractAsync,
    ]
  );

  return {
    stake,
    isStakePending: isApproving || isPending || result.isFetching,
    isStakeError: isError || result.isError,
    stakeError: error || result.error,
    stakeFailureReason: failureReason || result.failureReason,
    isStakeSuccess: result.isSuccess,
    allApprovalsConfirmed: allConfirmed,
  };
}
