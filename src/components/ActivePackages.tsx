import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { bsc } from "viem/chains";
import type { Address, Hex, Log } from "viem";
import LoadingActiveStakes from "./LoadingActiveStakes";
import { useActiveStakes } from "@/hooks/useActiveStakes";
import { buildActivePackagesColumns } from "./ActivePackagesColumns";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

/* Public row shape consumed by columns/actions */
export interface ActivePackageRow {
  id: string;
  packageName: string;
  amount: string;
  startDate: Date;
  nextClaimWindow?: Date;
  status: "Active" | "Inactive";
  stakeIndex: string;
  packageId: number;
  aprPct?: number;

  // Optional data used by actions/eligibility (provided by hook)
  isFullyUnstaked?: boolean;
  totalStakedWei?: bigint;
  claimedAprWei?: bigint;
  aprBps?: number;
  startTs?: number;
  nextClaimAt?: number;
  principalWithdrawnWei?: bigint;

  // Package rules snapshot to avoid per-row fetches
  pkgRules?: {
    durationInDays: number;
    aprBps: number;
    monthlyUnstake: boolean;
    isActive: boolean;
    monthlyAPRClaimable: boolean;
    claimableIntervalSec: number;
    principalLocked: boolean;
  };
}

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

/* -------------------- Optimistic “new stake” rows -------------------- */
type OptimisticRow = ActivePackageRow & {
  __optimistic: true;
  __createdAt: number; // ms
  __tempId?: string;   // when stakeIndex unknown yet
};
const OPTIMISTIC_TTL_MS = 30 * 60 * 1000; // 30 mins

function makeId(user?: string, stakeIndex?: string, fallback?: string) {
  if (user && stakeIndex) return `${user.toLowerCase()}:${stakeIndex}`;
  return `temp:${fallback || crypto.randomUUID()}`;
}

export default function ActivePackages({
  onClaim,
  onUnstake,
  renderWhenEmpty,
}: {
  onClaim?: () => Promise<void> | void;
  onUnstake?: () => Promise<void> | void;
  renderWhenEmpty?: boolean;
}) {
  const { address } = useAccount();

  // Short TTL because we now actively refresh on chain events, but this keeps the UI alive if an event was missed
  const { rows, loading, error, refresh } = useActiveStakes({ address, ttlMs: 45_000 });

  // Debounced refresh so multiple events within a block don't spam the subgraph
  const refreshTimer = useRef<number | null>(null);
  const debouncedRefresh = useMemo(
    () => () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => {
        refresh();
        refreshTimer.current = null;
      }, 900);
    },
    [refresh]
  );

  /* -------------------- On-chain log watcher (BSC) -------------------- */
  const publicClient = usePublicClient({ chainId: bsc.id });
  useEffect(() => {
    if (!publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: PROXY,
      abi: STAKING_ABI as any,
      onLogs: () => {
        // Catch-ups when subgraph lags but logs are already there
        debouncedRefresh();
      },
      onError: () => {},
      poll: true,
    });
    return () => { try { unwatch?.(); } catch {} };
  }, [publicClient, debouncedRefresh]);

  /* ------------------- Optimistic rows: add & reconcile ------------------- */
  const [optimisticRows, setOptimisticRows] = useState<Map<string, OptimisticRow>>(new Map());

  // purge expired optimistic rows
  useEffect(() => {
    const t = setInterval(() => {
      setOptimisticRows((m) => {
        const now = Date.now();
        const next = new Map(m);
        for (const [key, val] of next) {
          if (now - val.__createdAt > OPTIMISTIC_TTL_MS) next.delete(key);
        }
        return next;
      });
    }, 10_000);
    return () => clearInterval(t);
  }, []);

  // Consume optimistic stake events coming from StakingModal (or anywhere)
  useEffect(() => {
    function onOptimisticStake(ev: Event) {
      const detail = (ev as CustomEvent).detail as Partial<{
        user: Address;
        stakeIndex?: string;
        packageId?: number;
        packageName?: string;
        amountLabel?: string;   // human string for the “Amount” column
        startTs?: number;       // unix seconds
        txHash?: Hex;
      }> | undefined;

      if (!detail || !address) return;
      if (detail.user && detail.user.toLowerCase() !== address.toLowerCase()) return;

      const key = makeId(address, detail.stakeIndex, detail.txHash);
      const row: OptimisticRow = {
        __optimistic: true,
        __createdAt: Date.now(),
        __tempId: detail.stakeIndex ? undefined : detail.txHash || undefined,
        id: key,
        packageName: detail.packageName ?? `Package #${detail.packageId ?? "—"}`,
        amount: detail.amountLabel ?? "Pending…",
        startDate: detail.startTs ? new Date(detail.startTs * 1000) : new Date(),
        nextClaimWindow: undefined,
        status: "Active",
        stakeIndex: detail.stakeIndex ?? (detail.txHash || "0"),
        packageId: detail.packageId ?? 0,
        aprPct: undefined,
        isFullyUnstaked: false,
        totalStakedWei: undefined,
        claimedAprWei: undefined,
        aprBps: undefined,
        startTs: detail.startTs,
        nextClaimAt: undefined,
        principalWithdrawnWei: undefined,
        pkgRules: undefined,
      };

      setOptimisticRows((m) => {
        const next = new Map(m);
        next.set(key, row);
        return next;
      });

      // Ask data layer to refresh; subgraph will fill the real row shortly
      debouncedRefresh();
    }

    window.addEventListener("stake:optimistic", onOptimisticStake as EventListener);
    return () => window.removeEventListener("stake:optimistic", onOptimisticStake as EventListener);
  }, [address, debouncedRefresh]);

  // Reconcile: if a subgraph row with same (user:stakeIndex) shows up, drop the optimistic twin
  const mergedRows: ActivePackageRow[] = useMemo(() => {
    if (!rows?.length && optimisticRows.size === 0) return [];

    const realByKey = new Set<string>();
    (rows || []).forEach((r) => {
      // Real row ids in your app are stable; we’ll also build a key on (address:stakeIndex)
      const key = makeId(address, r.stakeIndex);
      realByKey.add(key);
    });

    // keep only optimistic rows whose keys aren’t present in real data yet
    const keptOptimistic: ActivePackageRow[] = [];
    for (const [key, opt] of optimisticRows) {
      if (!realByKey.has(key)) keptOptimistic.push(opt);
    }

    // Show optimistic at the top for visibility
    return [...keptOptimistic, ...(rows || [])];
  }, [rows, optimisticRows, address]);

  // When merged rows include a real row with same key, clean up optimistic to avoid memory growth
  useEffect(() => {
    setOptimisticRows((m) => {
      if (m.size === 0 || mergedRows.length === 0) return m;
      const next = new Map(m);
      const liveKeys = new Set(mergedRows.map((r) => makeId(address, r.stakeIndex)));
      for (const key of next.keys()) {
        if (liveKeys.has(key)) next.delete(key);
      }
      return next;
    });
  }, [mergedRows, address]);

  // Always refresh the table after row-level actions, regardless of parent callbacks.
  const columns = buildActivePackagesColumns({
    onClaim: async () => {
      try { await onClaim?.(); } finally { debouncedRefresh(); }
    },
    onUnstake: async () => {
      try { await onUnstake?.(); } finally { debouncedRefresh(); }
    },
  });

  if (loading && mergedRows.length === 0) return <LoadingActiveStakes />;
  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-500/30 p-6 text-rose-300">
        {error}
      </div>
    );
  }
  if (!mergedRows.length) {
    if (renderWhenEmpty) {
      return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          No active stakes.
        </div>
      );
    }
    return null;
  }

  return (
    <section className="mt-8">
      {/* Desktop table */}
      <div className="relative rounded-2xl overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-2xl hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur">
              <tr className="[&>th]:px-5 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:uppercase [&>th]:text-white/60">
                {columns.map((c) => (
                  <th key={c.key} className="font-medium">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {mergedRows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    "transition-colors " +
                    (row as any).__optimistic ? " bg-white/[0.02]" : " hover:bg-white/[0.03]"
                  }
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-4 align-middle">
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden -mx-4 px-4 mt-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
          {mergedRows.map((row) => (
            <div key={row.id} className="snap-center shrink-0 w-[88%]">
              <div className={"rounded-2xl p-4 border " + ((row as any).__optimistic ? "bg-white/5 border-white/15" : "bg-white/10 border-white/20")}>
                <div className="text-white font-semibold">{row.packageName}</div>
                <div className="text-white/80 text-sm mt-1">Amount: {row.amount}</div>
                <div className="text-white/60 text-xs mt-1">
                  Next claim: {row.nextClaimWindow
                    ? row.nextClaimWindow.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                    : "—"}
                </div>
                <div className="mt-3">
                  {columns.find((c) => c.key === "actions")?.render(row)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
