import type { Address } from 'viem'

/**
 * Returns the ERC20 token addresses your app uses.
 * Reads from env:
 *  - VITE_YYEARN_TOKEN_ADDRESS
 *  - VITE_SYEARN_TOKEN_ADDRESS
 *  - VITE_PYEARN_TOKEN_ADDRESS
 *  - VITE_ASSET_TOKEN_ADDRESS (fallback for all three, optional)
 */
export function useTokenAddresses() {
  // single fallback for all three if you only have one asset token
  const fallback = (import.meta.env.VITE_ASSET_TOKEN_ADDRESS ?? '') as Address

  const yYearnAddress = (import.meta.env.VITE_YYEARN_TOKEN_ADDRESS ?? fallback) as Address
  const sYearnAddress = (import.meta.env.VITE_SYEARN_TOKEN_ADDRESS ?? fallback) as Address
  const pYearnAddress = (import.meta.env.VITE_PYEARN_TOKEN_ADDRESS ?? fallback) as Address

  // Don’t block UI if envs are missing; just surface an error object
  const missing =
    !(yYearnAddress && yYearnAddress.length === 42) ||
    !(sYearnAddress && sYearnAddress.length === 42) ||
    !(pYearnAddress && pYearnAddress.length === 42)

  const error = missing
    ? new Error(
        'One or more token env vars are missing/invalid. Set VITE_YYEARN_TOKEN_ADDRESS, VITE_SYEARN_TOKEN_ADDRESS, VITE_PYEARN_TOKEN_ADDRESS or VITE_ASSET_TOKEN_ADDRESS.'
      )
    : null

  return {
    yYearnAddress,
    sYearnAddress,
    pYearnAddress,
    isLoading: false,
    error,
  }
}
