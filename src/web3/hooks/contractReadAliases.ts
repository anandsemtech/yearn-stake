import { useChainId, useReadContract } from 'wagmi'
import type { Address } from 'viem'
import { yearnTogetherAbi, yearnTogetherAddress } from '@/web3/__generated__/wagmi'

function useYTAddress(): Address {
  const chainId = useChainId()
  const map = yearnTogetherAddress as Record<number, Address> | undefined
  const fromMap = map?.[chainId] ?? map?.[84532] // Base Sepolia fallback
  const fromEnv = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? '') as Address
  return (fromMap || fromEnv) as Address
}

// ⛳️ If your ABI uses different names (e.g. getClaimableInterval), just change functionName strings.

export function useClaimableInterval() {
  const address = useYTAddress()
  return useReadContract({ address, abi: yearnTogetherAbi, functionName: 'claimableInterval' })
}

export function useClaimableStarLevelRewards(user?: Address) {
  const address = useYTAddress()
  const enabled = !!user
  return useReadContract({
    address,
    abi: yearnTogetherAbi,
    functionName: 'claimableStarLevelRewards',
    args: enabled ? [user as Address] : undefined,
    query: { enabled },
  })
}

export function useGoldenStarConfig() {
  const address = useYTAddress()
  return useReadContract({ address, abi: yearnTogetherAbi, functionName: 'goldenStarConfig' })
}

export function useIsGoldenStar(user?: Address) {
  const address = useYTAddress()
  const enabled = !!user
  return useReadContract({
    address,
    abi: yearnTogetherAbi,
    functionName: 'isGoldenStar',
    args: enabled ? [user as Address] : undefined,
    query: { enabled },
  })
}

export function useNextPackageId() {
  const address = useYTAddress()
  return useReadContract({ address, abi: yearnTogetherAbi, functionName: 'nextPackageId' })
}

export function usePendingGoldenStarRewards(user?: Address) {
  const address = useYTAddress()
  const enabled = !!user
  return useReadContract({
    address,
    abi: yearnTogetherAbi,
    functionName: 'pendingGoldenStarRewards',
    args: enabled ? [user as Address] : undefined,
    query: { enabled },
  })
}

/** Adjust arg order if your contract expects (token, user) */
export function useReferralEarnings(user?: Address, token?: Address) {
  const address = useYTAddress()
  const enabled = !!user && !!token
  return useReadContract({
    address,
    abi: yearnTogetherAbi,
    functionName: 'referralEarnings',
    args: enabled ? [user as Address, token as Address] : undefined,
    query: { enabled },
  })
}

export function useUserStarLevel(user?: Address) {
  const address = useYTAddress()
  const enabled = !!user
  return useReadContract({
    address,
    abi: yearnTogetherAbi,
    functionName: 'userStarLevel',
    args: enabled ? [user as Address] : undefined,
    query: { enabled },
  })
}
