// src/hooks/useAllowedCompositionsOnChain.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { usePublicClient } from "wagmi";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

export type CompositionRow = {
  id: string;
  index: number;
  yYearnPct: number;
  sYearnPct: number;
  pYearnPct: number;
};

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

export function useAllowedCompositions() {
  const publicClient = usePublicClient();
  const [rows, setRows] = useState<CompositionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const reloadFlag = useRef(0);

  async function load() {
    if (!publicClient || !PROXY) return;
    setIsLoading(true);
    setError(null);
    try {
      // Read uint8[][] from the contract
      const data = (await publicClient.readContract({
        address: PROXY,
        abi: STAKING_ABI,
        functionName: "getValidCompositions",
      })) as unknown as number[][]; // each inner array should be length 3

      const mapped: CompositionRow[] = (data || [])
        .map((comp, i) => ({
          id: `onchain-${i}`,
          index: i,
          yYearnPct: Number(comp?.[0] ?? 0),
          sYearnPct: Number(comp?.[1] ?? 0),
          pYearnPct: Number(comp?.[2] ?? 0),
        }))
        .filter((r) => r.yYearnPct + r.sYearnPct + r.pYearnPct === 100)
        .sort((a, b) => a.index - b.index);

      setRows(mapped);
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, PROXY, reloadFlag.current]);

  const refetch = () => {
    reloadFlag.current++;
    // trigger load via effect by updating ref value; simplest is direct call too:
    load();
  };

  return {
    compositions: rows,
    isLoading,
    error,
    refetch,
  };
}
