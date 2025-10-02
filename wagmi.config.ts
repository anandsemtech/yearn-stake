// wagmi.config.ts
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'

const abiPath = path.resolve(process.cwd(), 'src/web3/abi/abi.json')
const YearnTogetherAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'))

const CONTRACT_84532 = process.env.VITE_BASE_CONTRACT_ADDRESS
if (!CONTRACT_84532) throw new Error('VITE_BASE_CONTRACT_ADDRESS missing')

export default defineConfig({
  out: 'src/web3/__generated__/wagmi.ts',
  contracts: [
    {
      name: 'YearnTogether',
      abi: YearnTogetherAbi,
      address: { 84532: CONTRACT_84532 }, // ✅ baked for Base Sepolia
    },
    { name: 'ERC20', abi: erc20Abi },
  ],
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
