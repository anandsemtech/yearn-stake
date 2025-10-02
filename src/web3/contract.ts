// src/web3/contract.ts
import type { Address } from 'viem'
import { baseSepolia } from 'viem/chains'

export const BASE_CONTRACT_ADDRESS = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS || '') as Address

if (!BASE_CONTRACT_ADDRESS) {
  throw new Error('VITE_BASE_CONTRACT_ADDRESS is missing')
}

export const CONTRACT_ADDRESS: Record<number, Address> = {
  [baseSepolia.id]: BASE_CONTRACT_ADDRESS, // 84532
}
