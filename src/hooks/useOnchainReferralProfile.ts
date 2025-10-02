// src/hooks/useOnchainReferralProfile.ts
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

/** ENV */
const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";
const YY =
  (import.meta.env.VITE_YYEARN as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";
const SY =
  (import.meta.env.VITE_SYEARN as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";
const PY =
  (import.meta.env.VITE_PYEARN as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

const REF_SOURCE =
  (import.meta.env.VITE_REF_SOURCE as "history" | "events" | "auto") ?? "auto";
const LOGS_FROM_BLOCK =
  typeof import.meta.env.VITE_LOGS_FROM_BLOCK === "string" &&
  import.meta.env.VITE_LOGS_FROM_BLOCK !== ""
    ? (BigInt(import.meta.env.VITE_LOGS_FROM_BLOCK) as bigint)
    : (0n as const);

const TEST_REFERRER = (import.meta.env.VITE_TEST_REFERRER as string | undefined)?.toLowerCase();
const TEST_REFEREE = import.meta.env.VITE_TEST_REFEREE as Address | undefined;

const ZERO: Address = "0x0000000000000000000000000000000000000000";

/** TYPES */
type StakeData = {
  totalStaked: bigint;
  claimedAPR: bigint;
  withdrawnPrincipal: bigint;
  startTime: bigint;
  lastClaimedAt: bigint;
  lastUnstakedAt: bigint;
  packageId: number;
  isFullyUnstaked: boolean;
};

export type RefAggRow = {
  addr: Address;
  stakes: number;   // number of stakes by this referee
  totalYY: bigint;  // ALWAYS from userTotalStaked(ref) if > 0, else fallback to sum(splits)
  yy: bigint;       // split sum (may be 0 if not recoverable)
  sy: bigint;       // split sum (may be 0 if not recoverable)
  py: bigint;       // split sum (may be 0 if not recoverable)
};

export type LevelInfo = {
  level: number;    // 1..15
  totalYY: bigint;  // sum of rows' totalYY
  rows: RefAggRow[]; // entries for this level
};

export type OnchainProfile = {
  loading: boolean;
  error?: string;

  // Level 1 (directs) — preserved for existing UI
  refRows: RefAggRow[];
  refCount: number;

  // New: multi-level 1..15 (if available)
  levels?: LevelInfo[];

  // Current user
  myTotalYY: bigint;   // your wallet's total staked (YY)
  myTotalsYY: bigint;  // kept for backward compatibility (same as myTotalYY)
  activePackages: number;
  referredBy?: Address;

  // Earnings
  earningsYY: bigint;
  earningsSY: bigint;
  earningsPY: bigint;

  // Token decimals (assumed 18s)
  decimals: { yy: number; sy: number; py: number };
};

/** helpers */
export const fmt = (v: bigint, d = 18, max = 3) =>
  Number(formatUnits(v ?? 0n, d)).toLocaleString(undefined, {
    maximumFractionDigits: max,
  });

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const MAX_LEVEL = 15;
// Safety cap to avoid runaway graph explosions on dev chains
const MAX_TOTAL_NODES = 2000;

/** HOOK */
export function useOnchainReferralProfile(user?: Address): OnchainProfile {
  const client = usePublicClient();
  const [state, setState] = useState<OnchainProfile>({
    loading: true,
    refRows: [],
    refCount: 0,
    myTotalYY: 0n,
    myTotalsYY: 0n,
    activePackages: 0,
    referredBy: undefined,
    earningsYY: 0n,
    earningsSY: 0n,
    earningsPY: 0n,
    decimals: { yy: 18, sy: 18, py: 18 },
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!client || !user) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }

      setState((s) => ({ ...s, loading: true, error: undefined }));

      try {
        /** basics about current user */
        const [totalStaked, stakeCount, referredBy, yyEarn, syEarn, pyEarn] =
          (await client.multicall({
            allowFailure: false,
            contracts: [
              { address: PROXY, abi: STAKING_ABI, functionName: "userTotalStaked", args: [user] },
              { address: PROXY, abi: STAKING_ABI, functionName: "userStakeCounts", args: [user] },
              { address: PROXY, abi: STAKING_ABI, functionName: "referrerOf", args: [user] },
              { address: PROXY, abi: STAKING_ABI, functionName: "referralEarnings", args: [user, YY] },
              { address: PROXY, abi: STAKING_ABI, functionName: "referralEarnings", args: [user, SY] },
              { address: PROXY, abi: STAKING_ABI, functionName: "referralEarnings", args: [user, PY] },
            ],
          })) as [bigint, bigint, Address, bigint, bigint, bigint];

        // active packages count
        const myStakesCalls =
          Number(stakeCount) > 0
            ? Array.from({ length: Number(stakeCount) }, (_, i) => ({
                address: PROXY,
                abi: STAKING_ABI,
                functionName: "getStake",
                args: [user, BigInt(i)],
              }))
            : [];
        const myStakes = (myStakesCalls.length
          ? await client.multicall({ contracts: myStakesCalls, allowFailure: true })
          : []) as (StakeData | null)[];
        let activePackages = 0;
        for (const st of myStakes) if (st && !st.isFullyUnstaked) activePackages++;

        /** helpers to get referees for an address */
        const getRefereesFromHistory = async (addr: Address) => {
          try {
            return ((await client.readContract({
              address: PROXY,
              abi: STAKING_ABI,
              functionName: "getReferredUsers",
              args: [addr],
            })) || []) as Address[];
          } catch {
            return [];
          }
        };
        const getRefereesFromEvents = async (addr: Address) => {
          try {
            // event ReferralAssigned(address indexed user, address indexed referrer)
            const logs = await client.getLogs({
              address: PROXY,
              // @ts-ignore
              event: { abi: STAKING_ABI, eventName: "ReferralAssigned" },
              args: { referrer: addr },
              fromBlock: LOGS_FROM_BLOCK,
              toBlock: "latest",
            });
            return (logs.map((l: any) => l?.args?.user as Address).filter(Boolean) as Address[]) || [];
          } catch {
            return [];
          }
        };
        const getReferees = async (addr: Address) => {
          if (REF_SOURCE === "history") return getRefereesFromHistory(addr);
          if (REF_SOURCE === "events") return getRefereesFromEvents(addr);
          const h = await getRefereesFromHistory(addr);
          if (h && h.length) return h;
          return getRefereesFromEvents(addr);
        };

        /** Build level 1 (directs) first with full detail (including splits) */
        const me = user.toLowerCase();
        let level1 = await getReferees(user);
        level1 = uniq(level1.filter((a) => a && a !== ZERO && a.toLowerCase() !== me));

        /** DEV override: inject test referee under TEST_REFERRER */
        if (TEST_REFERRER && TEST_REFEREE && me === TEST_REFERRER.toLowerCase()) {
          if (!level1.find((x) => x.toLowerCase() === TEST_REFEREE.toLowerCase())) {
            level1.push(TEST_REFEREE);
          }
        }

        // Aggregate level 1 with splits (your original logic)
        const refRows: RefAggRow[] = [];
        for (const ref of level1) {
          // fast pass: totals + count
          const [refTotalYY, refStakeCount] =
            (await client.multicall({
              allowFailure: false,
              contracts: [
                { address: PROXY, abi: STAKING_ABI, functionName: "userTotalStaked", args: [ref] },
                { address: PROXY, abi: STAKING_ABI, functionName: "userStakeCounts", args: [ref] },
              ],
            })) as [bigint, bigint];

          const stakesN = Number(refStakeCount ?? 0n);
          let totalYY = refTotalYY ?? 0n; // prefer mapping
          let yy = 0n, sy = 0n, py = 0n;

          if (stakesN > 0) {
            // pull stake structs
            const stakeCalls = Array.from({ length: stakesN }, (_, i) => ({
              address: PROXY,
              abi: STAKING_ABI,
              functionName: "getStake",
              args: [ref, BigInt(i)],
            }));
            const refStakes = (await client.multicall({
              contracts: stakeCalls,
              allowFailure: true,
            })) as (StakeData | null)[];

            // token splits
            let computedSplitTotal = 0n;
            for (let i = 0; i < refStakes.length; i++) {
              const tokenCalls = [0, 1, 2].map((slot) => ({
                address: PROXY,
                abi: STAKING_ABI,
                functionName: "userStakeTokenAmounts",
                args: [ref, BigInt(i), BigInt(slot)],
              }));
              const tokenRows = await client.multicall({
                contracts: tokenCalls,
                allowFailure: true,
              });

              let stakeYY = 0n, stakeSY = 0n, stakePY = 0n;
              for (const r of tokenRows) {
                if (!r) continue;
                const rec = r as unknown as { token: Address; amount: bigint };
                if (!rec?.token) continue;
                const t = rec.token.toLowerCase();
                if (t === YY.toLowerCase()) stakeYY += rec.amount ?? 0n;
                else if (t === SY.toLowerCase()) stakeSY += rec.amount ?? 0n;
                else if (t === PY.toLowerCase()) stakePY += rec.amount ?? 0n;
              }

              yy += stakeYY; sy += stakeSY; py += stakePY;
              computedSplitTotal += stakeYY + stakeSY + stakePY;
            }

            if (totalYY === 0n && computedSplitTotal > 0n) {
              totalYY = computedSplitTotal;
            }
          }

          refRows.push({ addr: ref, stakes: Number(stakesN), totalYY, yy, sy, py });
        }

        /** ===== Multi-level expansion (2..15) =====
         *  Breadth-first traversal. For L>=2 we compute (addr, stakes, totalYY)
         *  without drilling token splits to keep RPC load healthy.
         */
        const levels: LevelInfo[] = [];
        // Seed level 1 from refRows
        const level1Total = refRows.reduce<bigint>((a, r) => a + (r.totalYY ?? 0n), 0n);
        levels.push({ level: 1, totalYY: level1Total, rows: refRows });

        const visited = new Set<string>();
        for (const a of level1) visited.add(a.toLowerCase());

        let frontier = [...level1];
        let totalNodes = frontier.length;

        for (let L = 2; L <= MAX_LEVEL; L++) {
          if (!frontier.length || totalNodes >= MAX_TOTAL_NODES) break;

          // Get referees for all addresses in the previous level in parallel
          const nextCandidatesNested = await Promise.all(
            frontier.map((addr) => getReferees(addr))
          );
          let next: Address[] = [];
          for (const arr of nextCandidatesNested) next.push(...arr);

          // Normalize + dedupe + avoid cycles/self
          const filtered = uniq(
            next.filter((a) => {
              const low = a?.toLowerCase?.();
              return a && a !== ZERO && low && low !== me && !visited.has(low);
            })
          );

          // Mark visited, apply global safety cap
          for (const a of filtered) visited.add(a.toLowerCase());
          totalNodes += filtered.length;
          if (totalNodes > MAX_TOTAL_NODES) {
            filtered.splice(MAX_TOTAL_NODES - (totalNodes - filtered.length));
          }

          if (!filtered.length) break;

          // Batch totals + counts for this level
          const contracts = filtered.flatMap((addr) => ([
            { address: PROXY, abi: STAKING_ABI, functionName: "userTotalStaked", args: [addr] },
            { address: PROXY, abi: STAKING_ABI, functionName: "userStakeCounts", args: [addr] },
          ]));
          const results = await client.multicall({ contracts, allowFailure: true });

          const rowsL: RefAggRow[] = [];
          for (let i = 0; i < filtered.length; i++) {
            const addr = filtered[i]!;
            const totalIdx = i * 2;
            const countIdx = i * 2 + 1;

            const totalYY = (results[totalIdx] as unknown as bigint) ?? 0n;
            const stakeCountRef = (results[countIdx] as unknown as bigint) ?? 0n;

            rowsL.push({
              addr,
              stakes: Number(stakeCountRef),
              totalYY,
              yy: 0n, sy: 0n, py: 0n, // deep levels: splits omitted for performance
            });
          }

          const totalYYLevel = rowsL.reduce<bigint>((a, r) => a + r.totalYY, 0n);
          levels.push({ level: L, totalYY: totalYYLevel, rows: rowsL });

          // Move frontier
          frontier = filtered;
        }

        if (!cancelled) {
          setState({
            loading: false,
            refRows,                           // level 1 details (directs)
            refCount: level1.length,
            levels,                            // 1..N levels (includes level 1)
            myTotalYY: totalStaked ?? 0n,      // NEW field
            myTotalsYY: totalStaked ?? 0n,     // backward-compatible alias
            activePackages,
            referredBy: referredBy === ZERO ? undefined : referredBy,
            earningsYY: yyEarn ?? 0n,
            earningsSY: syEarn ?? 0n,
            earningsPY: pyEarn ?? 0n,
            decimals: { yy: 18, sy: 18, py: 18 },
          });
        }
      } catch (e: any) {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: e?.message || "Failed to load" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, user]);

  return state;
}
