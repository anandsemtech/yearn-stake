import { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import type { Address } from 'viem'
import { erc20Abi } from 'viem'
import { yearnTogetherAddress } from '@/web3/__generated__/wagmi'

type Detail = {
  balance: number
  allowance: number
}

export const useTokenDetails = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()

  // token the user stakes / spends
  const tokenAddress = (import.meta.env.VITE_ASSET_TOKEN_ADDRESS ?? '') as Address
  // contract that needs allowance (spender)
  const spender =
    (yearnTogetherAddress as Record<number, Address> | undefined)?.[chainId] ||
    ((import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? '') as Address)

  const [detail, setDetail] = useState<Detail>({ balance: 0, allowance: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const canRead = useMemo(
    () =>
      Boolean(
        publicClient &&
          address &&
          tokenAddress &&
          tokenAddress.length === 42 &&
          spender &&
          (spender as string).length === 42,
      ),
    [publicClient, address, tokenAddress, spender],
  )

  const fetchOnceRef = useRef<() => Promise<void>>()

  const fetchDetails = async () => {
    if (!canRead) return
    try {
      setIsLoading(true)
      setError(null)

      const [balance, allowance] = await Promise.all([
        publicClient!.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as Address],
        }),
        publicClient!.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address as Address, spender as Address],
        }),
      ])

      // convert bigint -> number for your context (you already call Number(...) there)
      setDetail({
        balance: Number(balance ?? 0n),
        allowance: Number(allowance ?? 0n),
      })
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsLoading(false)
    }
  }

  // keep a stable refetch function reference (so WalletContext's setInterval can call it)
  useEffect(() => {
    fetchOnceRef.current = fetchDetails
  }, [canRead, publicClient, address, tokenAddress, spender])

  useEffect(() => {
    // initial fetch
    fetchDetails()
    // also when address changes, etc.
  }, [canRead, address, tokenAddress, spender])

  return {
    detail,
    isLoading,
    error,
    refetch: () => fetchOnceRef.current?.(),
  }
}
