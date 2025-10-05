// wagmi.config.ts
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { bsc } from 'wagmi/chains'
import { erc20Abi } from 'viem'

// -----------------------------------------------------------------------------
// Load ABI
// -----------------------------------------------------------------------------
const abiPath = path.resolve(process.cwd(), 'src/web3/abi/abi.json')
const YearnTogetherAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'))

// -----------------------------------------------------------------------------
// Environment variable (BSC mainnet)
// -----------------------------------------------------------------------------
const CONTRACT_56 = process.env.VITE_BASE_CONTRACT_ADDRESS
if (!CONTRACT_56) throw new Error('VITE_BASE_CONTRACT_ADDRESS missing')

// -----------------------------------------------------------------------------
// Wagmi codegen configuration
// -----------------------------------------------------------------------------
export default defineConfig({
  out: 'src/web3/__generated__/wagmi.ts',
  contracts: [
    {
      name: 'YearnTogether',
      abi: YearnTogetherAbi,
      address: { 56: CONTRACT_56 } as const, // ✅ BSC mainnet only
    },
    { name: 'ERC20', abi: erc20Abi },
  ],
  chains: [bsc],
  plugins: [
    react({
      useContractRead: true,
      useContractWrite: true,
      useSimulateContract: true,
      usePrepareContractWrite: true,
      useWaitForTransactionReceipt: true,
    }),
  ],
})
