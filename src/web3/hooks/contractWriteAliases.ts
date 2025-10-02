import { useChainId, useWriteContract } from 'wagmi'
import type { Address } from 'viem'
import { yearnTogetherAbi, yearnTogetherAddress } from '@/web3/__generated__/wagmi'

/** Resolve contract address from generated address map, with ENV fallback */
function useYTAddress(): Address {
  const chainId = useChainId()
  const map = yearnTogetherAddress as Record<number, Address> | undefined
  const fromMap = map?.[chainId] ?? map?.[84532] // 84532 = Base Sepolia
  const fromEnv = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? '') as Address
  return (fromMap || fromEnv) as Address
}

/** Helper to build a pre-filled write hook for a given function name */
function makeWriteHook<FN extends string>(functionName: FN) {
  return function usePrefilledWrite() {
    const address = useYTAddress()
    const { writeContract, data, isPending, error, status, variables } = useWriteContract()
    return {
      // call like: writeContract([arg1, arg2, ...])
      writeContract: (args?: readonly unknown[]) =>
        writeContract({
          abi: yearnTogetherAbi,
          address,
          functionName: functionName as any,
          args: (args as any) ?? [],
        }),
      data,
      isPending,
      error,
      status,
      variables,
    }
  }
}

/* ------------------------------------------------------------------ */
/*  EDIT functionName strings below if your ABI uses different names   */
/*  (e.g., 'claimAll', 'withdraw', 'stakeWithReferrer', etc.)          */
/* ------------------------------------------------------------------ */

// Staking
export const useStake = makeWriteHook('stake')            // args example: [amountWei, packageId]  ← adjust to your ABI
export const useUnstake = makeWriteHook('unstake')        // args example: [stakeIndex]            ← adjust

// Generic claim (if your contract has one)
export const useClaim = makeWriteHook('claim')            // no args, or adjust

// Rewards
export const useClaimReferralRewards   = makeWriteHook('claimReferralRewards')   // no args
export const useClaimStarLevelRewards  = makeWriteHook('claimStarLevelRewards')  // no args
export const useClaimGoldenStarRewards = makeWriteHook('claimGoldenStarRewards') // no args
