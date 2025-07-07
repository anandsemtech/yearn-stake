import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { erc20Abi } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useContractAddress } from ".";

export const useMultiTokenApprove = () => {
  const [selectedToken, setSelectedToken] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([]);
  const [receipts, setReceipts] = useState<
    Record<string, { isLoading: boolean; isSuccess: boolean }>
  >({});

  const { writeContractAsync } = useWriteContract();
  const spender = useContractAddress();
  const { address: account } = useAccount();
  const { data: allowance } = useReadContract({
    address: selectedToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: account ? [account, spender] : undefined,
    query: {
      enabled: !!selectedToken && !!account && !!spender,
    },
  });

  // Track the latest transaction for the existing hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHashes.length > 0 ? txHashes[txHashes.length - 1] : undefined,
      query: { enabled: txHashes.length > 0 },
    });

  // Update receipts when the latest transaction status changes
  useEffect(() => {
    if (txHashes.length > 0) {
      const latestHash = txHashes[txHashes.length - 1];
      setReceipts((prev) => ({
        ...prev,
        [latestHash]: { isLoading: isConfirming, isSuccess: isConfirmed },
      }));
    }
  }, [isConfirming, isConfirmed, txHashes]);

  const allConfirmed =
    txHashes.length > 0 && txHashes.every((hash) => receipts[hash]?.isSuccess);
  const anyLoading = txHashes.some((hash) => receipts[hash]?.isLoading);

  const multiTokenApprove = async (
    tokenList: { address: `0x${string}`; amount: bigint }[]
  ) => {
    const newTxHashes: `0x${string}`[] = [];

    const promises = tokenList.map(async (token) => {
      try {
        setSelectedToken(token.address);
        if (allowance && allowance < token.amount) {
          console.log("Approving", token.address, token.amount);
          const tx = await writeContractAsync({
            address: token.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [spender, token.amount],
            account,
          });
          newTxHashes.push(tx);
          console.log("Approved", token.address, token.amount);
        }
        console.log("Enough allowance", token.address, token.amount);
      } catch (error) {
        console.error("Error approving", token.address, token.amount, error);
        toast.error(`Error approving ${token.address}`);
      }
    });

    await Promise.all(promises);
    setTxHashes(newTxHashes);

    // Return a promise that resolves when all transactions are confirmed
    return new Promise<void>((resolve) => {
      const checkAllConfirmed = () => {
        if (allConfirmed) {
          resolve();
        } else {
          setTimeout(checkAllConfirmed, 1000); // Check every second
        }
      };
      checkAllConfirmed();
    });
  };

  return {
    multiTokenApprove,
    allConfirmed,
    anyLoading,
    txHashes,
    receipts,
  };
};
