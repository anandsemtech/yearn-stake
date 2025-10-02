// src/components/ActivePackages.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { buildActivePackagesColumns } from "./ActivePackagesColumns";
import {
  useWriteYearnTogetherClaimApr,
  useWriteYearnTogetherUnstake,
} from "@/web3/__generated__/wagmi";
import { usePublicClient, useAccount, useChainId } from "wagmi";
import { BaseError, decodeErrorResult } from "viem";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import LoadingActiveStakes from "./LoadingActiveStakes";
import clsx from "clsx";
import { Crown, Activity, DollarSign, CalendarClock } from "lucide-react";

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

/* ---- YearnTogether icon (watermark) ---- */
const IconYY: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="15" fill="#FFFFFF" />
    <circle cx="16" cy="16" r="13.5" fill="#2F6BFF" />
    <circle cx="16" cy="16" r="10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <path d="M16 9 L16 22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12 L11.5 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12 L20.5 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

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

  // Optional data (safe if undefined)
  isFullyUnstaked?: boolean;
  totalStakedWei?: bigint;
  claimedAprWei?: bigint;
  aprBps?: number;              // APR in basis points
  startTs?: number;             // seconds
  nextClaimAt?: number;         // seconds

  // Optional principal withdrawn for progress
  principalWithdrawnWei?: bigint;
}

export default function ActivePackages({
  activePackages,
  isLoading,
  renderWhenEmpty,
  onClaim,
  onUnstake,
}: {
  activePackages: ActivePackageRow[];
  isLoading: boolean;
  renderWhenEmpty?: boolean;
  onClaim?: () => Promise<void> | void;
  onUnstake?: () => Promise<void> | void;
}) {
  const columns = buildActivePackagesColumns({ onClaim, onUnstake });

  const publicClient = usePublicClient();
  const { address: uiAddress } = useAccount();
  const uiChainId = useChainId();

  const {
    writeContractAsync: claimAprAsync,
    isPending: claimPending,
  } = useWriteYearnTogetherClaimApr();

  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const claimWaitRef = useRef<Promise<void> | null>(null);

  function mapDecodedError(name: string): string | null {
    switch (name) {
      case "APRNotYetClaimable":
        return "Not yet claimable for the current interval.";
      case "APRAlreadyClaimed":
        return "APR already fully claimed.";
      case "APRClaimNotAllowed":
        return "Claim is only allowed at package end.";
      case "APRZeroAmount":
        return "Computed reward is zero.";
      case "InvalidStake":
        return "Invalid stake index for this wallet.";
      case "InactivePackage":
        return "This package is not active.";
      default:
        return null;
    }
  }

  function prettyError(err: unknown): string {
    if (err instanceof BaseError) {
      const revert = err.walk((e) => e.name === "ContractFunctionRevertedError") as any;
      const data: `0x${string}` | undefined = revert?.data;
      if (data) {
        try {
          const decoded = decodeErrorResult({ abi: STAKING_ABI as any, data });
          const nice = mapDecodedError((decoded as any).errorName);
          if (nice) return nice;
          if ((decoded as any).errorName) return `Reverted: ${(decoded as any).errorName}`;
        } catch {}
      }
      if ((err as any).shortMessage) return (err as any).shortMessage as string;
      return err.message;
    }
    return (err as any)?.message || "Transaction reverted";
  }

  async function decodeOnchainRevert(hash: `0x${string}`, blockNumber: bigint) {
    try {
      const tx = await publicClient.getTransaction({ hash });
      await publicClient.call({
        to: tx.to!,
        data: tx.input as `0x${string}`,
        value: tx.value,
        account: tx.from,
        blockNumber,
      });
      return "Reverted (no revert data provided)";
    } catch (e) {
      return prettyError(e);
    }
  }

  useEffect(() => {
    if (!claimTxHash) return;
    if (claimWaitRef.current) return;

    claimWaitRef.current = (async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: claimTxHash,
          confirmations: 1,
        });

        try {
          const tx = await publicClient.getTransaction({ hash: claimTxHash });
          console.debug("[AddrCheck] UI wrote to:", tx.to, "expected proxy:", PROXY);
        } catch {}

        if (receipt.status === "reverted") {
          const reason = await decodeOnchainRevert(claimTxHash, receipt.blockNumber);
          setClaimMsg(reason || "Transaction reverted");
          return;
        }

        setClaimMsg("✅ Claim succeeded");
        window.dispatchEvent(new CustomEvent("staking:updated"));
      } catch (e: any) {
        console.error("[claimAPR] receipt wait failed", e);
        setClaimMsg(prettyError(e));
      } finally {
        claimWaitRef.current = null;
      }
    })();
  }, [publicClient, claimTxHash]);

  

  if (isLoading) {
    return <LoadingActiveStakes />;
  }

  if (!activePackages?.length) {
    if (renderWhenEmpty) {
      return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          No active stakes.
        </div>
      );
    }
    return null;
  }

  // ribbons
  const ribbon = (s: ActivePackageRow["status"]) =>
    s === "Active"
      ? "from-emerald-500/70 to-emerald-400/60 text-emerald-950"
      : "from-slate-400/70 to-slate-300/60 text-slate-900";

  // bigint-safe percent helpers
  const pctFromBigint = (num?: bigint, den?: bigint) => {
    if (!num || !den || den === 0n) return 0;
    const v = Number(num) / Number(den);
    return Math.max(0, Math.min(100, v * 100));
  };
  const aprCapWei = (stake?: bigint, aprBps?: number) =>
    stake && typeof aprBps === "number" && aprBps > 0
      ? (stake * BigInt(aprBps)) / 10000n
      : undefined;

  /* Horizontal bar atom with left label */
  const HBar: React.FC<{
    value: number; // 0..100
    label: string;
    accent: "green" | "amber";
    widthClass?: string; // e.g., "w-40 sm:w-48"
  }> = ({ value, label, accent, widthClass = "w-40 sm:w-48" }) => (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[11px] text-gray-400 text-right">{label}</span>
      <div className={clsx("h-1.5 rounded-full bg-white/10 overflow-hidden", widthClass)}>
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-500",
            accent === "green" ? "bg-emerald-400" : "bg-amber-400"
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
        />
      </div>
      <div className="text-[10px] text-gray-300 w-10 text-right">{Math.round(value)}%</div>
    </div>
  );

  // Glass Card (reuses action renderer, stays integrated)
  const GlassCard = ({ row }: { row: ActivePackageRow }) => {
    const actions = columns.find((c) => c.key === "actions")!;
    const aprCell = columns.find((c) => c.key === "apr")!;
    const amountCell = columns.find((c) => c.key === "amount")!;
    const nextCell = columns.find((c) => c.key === "next")!;

    const publicClientLocal = usePublicClient();
    const { address } = useAccount();

    // --- dynamic on-chain snapshot (for live progress) ---
    type StakeSnap = {
      totalStaked: bigint;
      claimedAPR: bigint;
      withdrawnPrincipal: bigint;
    };
    const [snap, setSnap] = useState<StakeSnap | null>(null);

    // If apr bps isn't provided on the row, we'll lazily fetch it from the package.
    const [pkgAprBps, setPkgAprBps] = useState<number | undefined>(row.aprBps);

    useEffect(() => {
      let alive = true;
      (async () => {
        if (pkgAprBps != null) return;
        try {
          const res: any = await publicClientLocal.readContract({
            address: PROXY,
            abi: STAKING_ABI as any,
            functionName: "packages",
            args: [BigInt(row.packageId)],
          });
          const apr = typeof res?.apr === "bigint" ? Number(res.apr) : typeof res?.apr === "number" ? res.apr : Number(res?.[2] ?? 0);
          if (alive) setPkgAprBps(apr);
        } catch {}
      })();
      return () => {
        alive = false;
      };
    }, [publicClientLocal, row.packageId, pkgAprBps]);

    useEffect(() => {
      let alive = true;
      (async () => {
        if (!address) return;
        try {
          const stake: any = await publicClientLocal.readContract({
            address: PROXY,
            abi: STAKING_ABI as any,
            functionName: "getStake",
            args: [address, BigInt(row.stakeIndex)],
          });

          const s: StakeSnap = {
            totalStaked:        BigInt(stake.totalStaked ?? stake[0] ?? 0),
            claimedAPR:         BigInt(stake.claimedAPR ?? stake[1] ?? 0),
            withdrawnPrincipal: BigInt(stake.withdrawnPrincipal ?? stake[2] ?? 0),
          };
          if (alive) setSnap(s);
        } catch {}
      })();

      const h = () => {
        // refresh when any staking action happens
        if (!address) return;
        publicClientLocal
          .readContract({
            address: PROXY,
            abi: STAKING_ABI as any,
            functionName: "getStake",
            args: [address, BigInt(row.stakeIndex)],
          })
          .then((stake: any) => {
            const s: StakeSnap = {
              totalStaked:        BigInt(stake.totalStaked ?? stake[0] ?? 0),
              claimedAPR:         BigInt(stake.claimedAPR ?? stake[1] ?? 0),
              withdrawnPrincipal: BigInt(stake.withdrawnPrincipal ?? stake[2] ?? 0),
            };
            setSnap(s);
          })
          .catch(() => {});
      };
      window.addEventListener("staking:updated", h);
      return () => {
        alive = false;
        window.removeEventListener("staking:updated", h);
      };
    }, [publicClientLocal, address, row.stakeIndex]);

    // --- fallback (from row props) ---
    const capWeiFallback = aprCapWei(row.totalStakedWei, row.aprBps);
    const claimPctFallback =
      capWeiFallback && row.claimedAprWei ? pctFromBigint(row.claimedAprWei, capWeiFallback) : 0;
    const principalPctFallback = pctFromBigint(row.principalWithdrawnWei, row.totalStakedWei);

    // --- dynamic percentages (prefer on-chain snapshot if available) ---
    const claimPct = useMemo(() => {
      if (!snap || !(pkgAprBps! > 0)) return claimPctFallback;
      const cap = (snap.totalStaked * BigInt(pkgAprBps!)) / 10000n;
      if (cap <= 0n) return 0;
      return pctFromBigint(snap.claimedAPR, cap);
    }, [snap, pkgAprBps, claimPctFallback]);

    const principalPct = useMemo(() => {
      if (!snap) return principalPctFallback;
      return pctFromBigint(snap.withdrawnPrincipal, snap.totalStaked);
    }, [snap, principalPctFallback]);

    return (
      <div
        className={clsx(
          "relative rounded-3xl p-4 sm:p-5",
          "bg-white/10 dark:bg-white/5 backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]"
        )}
      >
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-white/10 via-white/0 to-white/10 opacity-60" />
        </div>

        {/* watermark (non-interactive) */}
        <div className="pointer-events-none absolute bottom-3 right-3 opacity-10">
          <IconYY className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>

        {/* status ribbon */}
        <div
          className={clsx(
            "absolute -top-2 left-4 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
            "bg-gradient-to-r",
            ribbon(row.status)
          )}
        >
          {row.status.toUpperCase()}
        </div>

        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-300 drop-shadow" />
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {row.packageName}
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-gray-200">
              <DollarSign className="w-4 h-4 text-amber-300" />
              <span className="font-medium">{amountCell.render(row)}</span>
            </div>
          </div>

          {/* right cluster: APR pill + compact horizontal bars */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-purple-500/20 border border-purple-300/30">
              <Activity className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-[12px] font-semibold text-purple-100">
                {typeof row.aprPct === "number"
                  ? `APR ${row.aprPct.toFixed(2)}%`
                  : aprCell.render(row)}
              </span>
            </div>

            {/* horizontal bars on sm+ */}
            <div className="hidden sm:flex flex-col items-end gap-1.5">
              <HBar value={claimPct} accent="green" label="Claim" />
              <HBar value={principalPct} accent="amber" label="Principal" />
            </div>
          </div>
        </div>

        {/* middle: next claim */}
        <div className="mt-3">
          <div className="text-[13px] flex items-center gap-2 text-gray-200">
            <CalendarClock className="w-4 h-4 text-sky-200" />
            <div className="truncate">{nextCell.render(row)}</div>
          </div>

          {/* mobile-only bars under next-claim (full width) */}
          <div className="sm:hidden mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <HBar value={claimPct} accent="green" label="Claim" widthClass="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <HBar value={principalPct} accent="amber" label="Principal" widthClass="w-full" />
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-4">
          {actions.render(row)}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-8">
      {/* Desktop table (unchanged) */}
      <div
        className="
          relative rounded-2xl overflow-hidden
          bg-white/[0.04] ring-1 ring-white/10 shadow-2xl hidden md:block
          before:absolute before:inset-x-0 before:top-0 before:h-px
          before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent
        "
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
              <tr className="[&>th]:px-5 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:tracking-wide [&>th]:uppercase [&>th]:text-white/60">
                {columns.map((c) => (
                  <th key={c.key} className="font-medium">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-white/90">
              {activePackages.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
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

      {/* Mobile: glass wallet cards (snap carousel) */}
      <div className="md:hidden -mx-4 px-4 mt-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
          {activePackages.map((row) => (
            <div key={row.id} className="snap-center shrink-0 w-[88%]">
              <GlassCard row={row} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
