// src/web3/hooks/useLogReferralRewards.ts
import { useEffect } from "react";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import { formatUnits, Address } from "viem";

// Getter ABIs so we read the token addresses from the staking contract
const TOKEN_GETTERS_ABI = [
  { type: "function", name: "yYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "sYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

// mapping getter
const REFERRAL_EARNINGS_ABI = [
  {
    type: "function",
    name: "referralEarnings",
    stateMutability: "view",
    inputs: [
      { name: "referrer", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

const PROXY = import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`;

// (optional) keep envs just to warn if they differ from on-chain
const Y_ENV = import.meta.env.VITE_YYEARN_ADDRESS as `0x${string}` | undefined;
const S_ENV = import.meta.env.VITE_SYEARN_ADDRESS as `0x${string}` | undefined;
const P_ENV = import.meta.env.VITE_PYEARN_ADDRESS as `0x${string}` | undefined;

export function useLogReferralRewards() {
  const { address } = useAccount();
  const chainId = useChainId();
  const client = usePublicClient();

  useEffect(() => {
    console.log("[useLogReferralRewards] mounted", { address, chainId, hasClient: !!client });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!client || !address || !PROXY) return;

    (async () => {
      try {
        // 1) Read token addresses from the staking contract
        const [yOn, sOn, pOn] = (await Promise.all([
          client.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "yYearn" }),
          client.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "sYearn" }),
          client.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "pYearn" }),
        ])) as [Address, Address, Address];

        console.log("[useLogReferralRewards] token addresses (on-chain)", { yOn, sOn, pOn });

        // 2) Optional: show ENV vs on-chain mismatch once
        const warnIfDiff = (label: string, env?: string, on?: string) => {
          if (env && on && env.toLowerCase() !== on.toLowerCase()) {
            console.warn(`[useLogReferralRewards] ${label} ENV != on-chain`, { env, on });
          }
        };
        warnIfDiff("YY", Y_ENV, yOn);
        warnIfDiff("SY", S_ENV, sOn);
        warnIfDiff("PY", P_ENV, pOn);

        // 3) Read balances using the **on-chain** addresses (this matches claimReferralRewards)
        const [ry, rs, rp] = (await Promise.all([
          client.readContract({
            address: PROXY,
            abi: REFERRAL_EARNINGS_ABI,
            functionName: "referralEarnings",
            args: [address as Address, yOn],
          }),
          client.readContract({
            address: PROXY,
            abi: REFERRAL_EARNINGS_ABI,
            functionName: "referralEarnings",
            args: [address as Address, sOn],
          }),
          client.readContract({
            address: PROXY,
            abi: REFERRAL_EARNINGS_ABI,
            functionName: "referralEarnings",
            args: [address as Address, pOn],
          }),
        ])) as [bigint, bigint, bigint];

        console.log(`[referralEarnings][${address}][chain ${chainId}] raw (on-chain tokens):`, {
          y: ry.toString(),
          s: rs.toString(),
          p: rp.toString(),
          total: (ry + rs + rp).toString(),
        });

        console.log(`[referralEarnings][${address}][chain ${chainId}] formatted (18dp, on-chain tokens):`, {
          y: formatUnits(ry, 18),
          s: formatUnits(rs, 18),
          p: formatUnits(rp, 18),
          total: formatUnits(ry + rs + rp, 18),
        });

        // 4) (Optional) also show what ENV addresses would read, to visualize any mismatch
        if (Y_ENV && S_ENV && P_ENV) {
          const [ryEnv, rsEnv, rpEnv] = (await Promise.all([
            client.readContract({
              address: PROXY,
              abi: REFERRAL_EARNINGS_ABI,
              functionName: "referralEarnings",
              args: [address as Address, Y_ENV],
            }),
            client.readContract({
              address: PROXY,
              abi: REFERRAL_EARNINGS_ABI,
              functionName: "referralEarnings",
              args: [address as Address, S_ENV],
            }),
            client.readContract({
              address: PROXY,
              abi: REFERRAL_EARNINGS_ABI,
              functionName: "referralEarnings",
              args: [address as Address, P_ENV],
            }),
          ])) as [bigint, bigint, bigint];

          console.log(`[referralEarnings][${address}][chain ${chainId}] formatted (ENV tokens):`, {
            y: formatUnits(ryEnv, 18),
            s: formatUnits(rsEnv, 18),
            p: formatUnits(rpEnv, 18),
            total: formatUnits(ryEnv + rsEnv + rpEnv, 18),
          });
        }
      } catch (e) {
        console.error("[useLogReferralRewards] read failed:", e);
      }
    })();
  }, [client, address, chainId]);
}
