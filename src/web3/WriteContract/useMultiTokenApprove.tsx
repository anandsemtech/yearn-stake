import { useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { erc20Abi } from "viem";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
} from "wagmi";

import { useContractAddress } from ".";

interface TokenApproval {
  address: `0x${string}`;
  amount: bigint;
}

interface ApprovalState {
  isLoading: boolean;
  isSuccess: boolean;
  error?: string;
}

interface AllowanceCheck {
  token: TokenApproval;
  currentAllowance: bigint;
  needsApproval: boolean;
}

export const useMultiTokenApprove = () => {
  const [pendingApprovals, setPendingApprovals] = useState<TokenApproval[]>([]);
  const [approvalStates, setApprovalStates] = useState<Record<string, ApprovalState>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const spender = useContractAddress();
  const { address: account } = useAccount();

  const resetState = useCallback(() => {
    setPendingApprovals([]);
    setApprovalStates({});
    setIsProcessing(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const checkAllowances = useCallback(async (tokenList: TokenApproval[]): Promise<AllowanceCheck[]> => {
    if (!account || !spender || !publicClient) {
      return tokenList.map(token => ({
        token,
        currentAllowance: 0n,
        needsApproval: true
      }));
    }

    const allowanceChecks = await Promise.allSettled(
      tokenList.map(async (token) => {
        const currentAllowance = await publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account, spender],
        });

        return {
          token,
          currentAllowance: currentAllowance || 0n,
          needsApproval: (currentAllowance || 0n) < token.amount,
        };
      })
    );

    return allowanceChecks.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            token: tokenList[index],
            currentAllowance: 0n,
            needsApproval: true
          }
    );
  }, [account, spender, publicClient]);

  const allConfirmed = pendingApprovals.length > 0 && 
    pendingApprovals.every(token => approvalStates[token.address]?.isSuccess);
  
  const anyLoading = isProcessing || 
    Object.values(approvalStates).some(state => state.isLoading);

  const waitForTransactionReceipt = useCallback(async (
    txHash: `0x${string}`, 
    tokenAddress: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error('Operation cancelled'));
            return;
          }

          const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
          
          if (receipt?.status === 'success') {
            setApprovalStates(prev => ({
              ...prev,
              [tokenAddress]: { isLoading: false, isSuccess: true }
            }));
            resolve();
          } else {
            throw new Error('Transaction failed');
          }
        } catch (error) {
          setApprovalStates(prev => ({
            ...prev,
            [tokenAddress]: { 
              isLoading: false, 
              isSuccess: false, 
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          reject(error);
        }
      };

      checkReceipt();
    });
  }, [publicClient]);

  const multiTokenApprove = useCallback(async (
    tokenList: TokenApproval[]
  ): Promise<void> => {
    if (!account || !spender || tokenList.length === 0) {
      return;
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      const allowanceChecks = await checkAllowances(tokenList);
      const tokensNeedingApproval = allowanceChecks.filter(check => check.needsApproval);

      if (tokensNeedingApproval.length === 0) {
        setIsProcessing(false);
        return;
      }

      setPendingApprovals(tokensNeedingApproval.map(check => check.token));

      const approvalPromises = tokensNeedingApproval.map(async ({ token }) => {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Operation cancelled');
        }

        setApprovalStates(prev => ({
          ...prev,
          [token.address]: { isLoading: true, isSuccess: false }
        }));

        try {
          const txHash = await writeContractAsync({
            address: token.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [spender, token.amount],
            account,
          });

          await waitForTransactionReceipt(txHash, token.address);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          setApprovalStates(prev => ({
            ...prev,
            [token.address]: { 
              isLoading: false, 
              isSuccess: false, 
              error: errorMessage 
            }
          }));

          toast.error(`Failed to approve ${token.address}: ${errorMessage}`);
          throw error;
        }
      });

      await Promise.all(approvalPromises);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Operation cancelled') {
        toast.error('Multi-token approval failed');
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [account, spender, checkAllowances, writeContractAsync, waitForTransactionReceipt]);

  return {
    multiTokenApprove,
    allConfirmed,
    anyLoading,
    isProcessing,
    pendingApprovals,
    approvalStates,
    resetState,
  };
};
