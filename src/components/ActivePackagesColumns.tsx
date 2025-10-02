// src/components/ActivePackagesColumns.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { ActivePackageRow } from "./ActivePackages";
import ResponsiveDisabledHint from "./ResponsiveDisabledHint";

// generated hooks
import {
  useWriteYearnTogetherClaimApr,
  useWriteYearnTogetherUnstake,
} from "@/web3/__generated__/wagmi";

// wagmi + viem
import { usePublicClient, useAccount } from "wagmi";
import { BaseError, decodeErrorResult } from "viem";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

const PROXY = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

// Icons (inline SVG)
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
const IconTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M16 6h5v5h-2V9.41l-5.29 5.3l-4-4L3 17.41L1.59 16L9.7 7.9l4 4L17.59 8H16z"/></svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m.75 5h-1.5v6l5.25 3.15l.75-1.23l-4.5-2.67Z"/></svg>
);
const IconBolt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v3h6V6a3 3 0 0 0-3-3Z"/></svg>
);

// helpers
const fmtDateTime = (d?: Date) =>
  d
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d)
    : "—";
const fmtDateTimeSeconds = (d?: Date) =>
  d
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Kolkata" }).format(d)
    : "—";

function isClaimAvailable(next?: Date) {
  if (!next) return true;
  return next.getTime() <= Date.now();
}

function isAprFullyClaimedByAmount(row: ActivePackageRow, pkgAprBps?: number) {
  // Amount-based check (if your row includes claimedAprWei). Keep as a hint.
  if (!row.totalStakedWei || !row.claimedAprWei) return false;
  const aprBps = pkgAprBps ?? row.aprBps ?? 0;
  if (aprBps <= 0) return false;
  const maxRewardWei = (row.totalStakedWei * BigInt(aprBps)) / 10000n;
  return row.claimedAprWei >= maxRewardWei;
}

// --- package info shape ---
type PkgInfo = {
  id?: number;
  durationInDays?: number;
  apr?: number; // bps
  monthlyUnstake?: boolean;
  isActive?: boolean;
  minStakeAmount?: bigint;
  monthlyPrincipalReturnPercent?: number;
  monthlyAPRClaimable?: boolean;
  claimableInterval?: number; // seconds
  stakeMultiple?: bigint;
  principalLocked?: boolean;
};

async function readPkgInfo(publicClient: ReturnType<typeof usePublicClient>, pkgId: number) {
  try {
    const res: any = await publicClient.readContract({
      address: PROXY,
      abi: STAKING_ABI as any,
      functionName: "packages",
      args: [BigInt(pkgId)],
    });

    const num = (v: any, def = 0) =>
      typeof v === "bigint" ? Number(v) : typeof v === "number" ? v : v != null ? Number(v) : def;
    const bool = (v: any) => Boolean(v);

    return {
      id:                            num(res.id ?? res[0]),
      durationInDays:                num(res.durationInDays ?? res[1]),
      apr:                           num(res.apr ?? res[2]),
      monthlyUnstake:                bool(res.monthlyUnstake ?? res[3]),
      isActive:                      bool(res.isActive ?? res[4]),
      minStakeAmount:                (res.minStakeAmount ?? res[5]) as bigint,
      monthlyPrincipalReturnPercent: num(res.monthlyPrincipalReturnPercent ?? res[6]),
      monthlyAPRClaimable:           bool(res.monthlyAPRClaimable ?? res[7]),
      claimableInterval:             num(res.claimableInterval ?? res[8]),
      stakeMultiple:                 (res.stakeMultiple ?? res[9]) as bigint,
      principalLocked:               bool(res.principalLocked ?? res[10]),
    } as PkgInfo;
  } catch {
    return null;
  }
}

export function buildActivePackagesColumns({
  onClaim,
  onUnstake,
}: {
  onClaim?: () => Promise<void> | void;
  onUnstake?: () => Promise<void> | void;
}) {
  return [
    { key: "pkg", header: "PACKAGE NAME", render: (r: ActivePackageRow) => <div className="font-medium text-foreground">{r.packageName}</div> },
    {
      key: "amount", header: "AMOUNT",
      render: (r: ActivePackageRow) => (
        <div className="flex items-center gap-2 tabular-nums text-white/85">
          <IconYY className="w-5 h-5 opacity-90" />
          <span>{r.amount}</span>
        </div>
      ),
    },
    {
      key: "apr", header: "APR",
      render: (r: ActivePackageRow) => (
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="opacity-90"><IconTrendUp /></span>
          <span className="font-medium">{typeof r.aprPct === "number" ? `${r.aprPct.toFixed(2)}%` : "—"}</span>
        </div>
      ),
    },
    {
      key: "start", header: "START DATE",
      render: (r: ActivePackageRow) => {
        const startDate = typeof (r as any).startTs === "number" && (r as any).startTs > 0 ? new Date((r as any).startTs * 1000) : r.startDate;
        return <span title={startDate ? startDate.toISOString() : "—"}>{fmtDateTimeSeconds(startDate)}</span>;
      },
    },
    {
      key: "next", header: "NEXT CLAIM",
      render: (r: ActivePackageRow) => {
        const available = isClaimAvailable(r.nextClaimWindow);
        const when = fmtDateTime(r.nextClaimWindow);
        return available ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span><IconClock /></span>
            <div className="flex flex-col">
              <span className="font-medium">Available now</span>
              <span className="text-xs opacity-80">{when}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span><IconClock /></span>
            <span>{when}</span>
          </div>
        );
      },
    },
    {
      key: "status", header: "STATUS",
      render: (r: ActivePackageRow) => {
        const active = r.status === "Active";
        return (
          <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 " +
            (active ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20" : "bg-white/10 text-white/60 ring-white/15")}>
            <span className={"h-1.5 w-1.5 rounded-full " + (active ? "bg-emerald-400" : "bg-white/30")} />
            {r.status.toLowerCase()}
          </span>
        );
      },
    },
    { key: "actions", header: "ACTIONS", render: (r: ActivePackageRow) => <RowActions row={r} onClaim={onClaim} onUnstake={onUnstake} /> },
  ];
}

const RowActions: React.FC<{
  row: ActivePackageRow;
  onClaim?: () => Promise<void> | void;
  onUnstake?: () => Promise<void> | void;
}> = ({ row, onClaim, onUnstake }) => {
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"claim" | "unstake" | null>(null);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { writeContractAsync: claimAprAsync, isPending: claimPending } = useWriteYearnTogetherClaimApr();
  const { writeContractAsync: unstakeAsync,   isPending: unstakePending } = useWriteYearnTogetherUnstake();

  // ---- Package info (rules) ----
  const [pkgInfo, setPkgInfo] = useState<PkgInfo | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const info = await readPkgInfo(publicClient, row.packageId);
      if (alive) setPkgInfo(info);
    })();
    return () => { alive = false; };
  }, [publicClient, row.packageId]);

  // ---- On-chain stake snapshot (for both fullyUnstaked & fullyClaimed derivations) ----
  type StakeSnap = {
    totalStaked: bigint;
    withdrawnPrincipal: bigint;
    startTime: number;      // seconds
    lastClaimedAt: number;  // seconds
    lastUnstakedAt: number; // seconds (optional safety)
  };

  const [snap, setSnap] = useState<StakeSnap | null>(null);

  const fetchStake = useCallback(async () => {
    if (!address) return;
    try {
      const stake: any = await publicClient.readContract({
        address: PROXY,
        abi: STAKING_ABI as any,
        functionName: "getStake",
        args: [address, BigInt(row.stakeIndex)],
      });

      // Adjust indices if your struct ordering differs
      const s: StakeSnap = {
        totalStaked:           (stake.totalStaked ?? stake[0]) as bigint,
        withdrawnPrincipal:    (stake.withdrawnPrincipal ?? stake[1]) as bigint,
        startTime:             Number(stake.startTime ?? stake[2] ?? 0),
        lastClaimedAt:         Number(stake.lastClaimedAt ?? stake[3] ?? 0),
        lastUnstakedAt:        Number(stake.lastUnstakedAt ?? stake[4] ?? 0),
      };

      setSnap(s);

      if (Number(row.stakeIndex) === 11) {
        console.groupCollapsed(`[stake#11] getStake snapshot`);
        console.log("totalStaked:", String(s.totalStaked));
        console.log("withdrawnPrincipal:", String(s.withdrawnPrincipal));
        console.log("startTime:", s.startTime, new Date(s.startTime * 1000).toISOString());
        console.log("lastClaimedAt:", s.lastClaimedAt, s.lastClaimedAt ? new Date(s.lastClaimedAt * 1000).toISOString() : "—");
        console.groupEnd();
      }
    } catch (e) {
      console.warn("[ActivePackages] getStake read failed", e);
    }
  }, [address, publicClient, row.stakeIndex]);

  useEffect(() => { fetchStake(); }, [fetchStake]);
  useEffect(() => {
    const h = () => fetchStake();
    window.addEventListener("staking:updated", h);
    return () => window.removeEventListener("staking:updated", h);
  }, [fetchStake]);

  // ---- Derived booleans ----
  const derivedFullyUnstaked = useMemo(() => {
    if (!snap) return Boolean(row.isFullyUnstaked);
    return snap.withdrawnPrincipal >= snap.totalStaked || Boolean(row.isFullyUnstaked);
  }, [snap, row.isFullyUnstaked]);

  const derivedFullyClaimed = useMemo(() => {
    // Prefer rules-based derivation using timing (works without needing claimed amount storage)
    if (!snap || !pkgInfo) return false;
    const start = snap.startTime || 0;
    const last = snap.lastClaimedAt || 0;
    const dur  = Number(pkgInfo.durationInDays || 0) * 86400;

    if (start <= 0 || dur <= 0) return false;

    if (pkgInfo.monthlyAPRClaimable) {
      const interval = Number(pkgInfo.claimableInterval || 0);
      if (interval <= 0) return false;
      const totalPeriods   = Math.floor(dur / interval);
      const claimedPeriods = Math.floor((Math.max(last, start) - start) / interval);
      // When claimedPeriods >= totalPeriods → fully claimed
      const fully = claimedPeriods >= totalPeriods;

      if (Number(row.stakeIndex) === 11) {
        console.groupCollapsed(`[stake#11] Claim derivation (monthly)`);
        console.log("totalPeriods:", totalPeriods, "claimedPeriods:", claimedPeriods);
        console.log("start:", start, "last:", last, "interval:", interval, "duration(sec):", dur);
        console.log("derivedFullyClaimed:", fully);
        console.groupEnd();
      }
      return fully;
    } else {
      // Non-monthly: one-shot at/after maturity → treat as fully-claimed if lastClaimedAt >= maturity
      const maturity = start + dur;
      const fully = last >= maturity && last > 0;

      if (Number(row.stakeIndex) === 11) {
        console.groupCollapsed(`[stake#11] Claim derivation (non-monthly)`);
        console.log("maturity:", maturity, new Date(maturity * 1000).toISOString());
        console.log("lastClaimedAt:", last, last ? new Date(last * 1000).toISOString() : "—");
        console.log("derivedFullyClaimed:", fully);
        console.groupEnd();
      }
      return fully;
    }
  }, [snap, pkgInfo, row.stakeIndex]);

  // Also keep the old amount-based hint if your row populates claimedAprWei:
  const amountBasedFullyClaimed = useMemo(() => {
    if (!pkgInfo) return false;
    return isAprFullyClaimedByAmount(row, pkgInfo.apr);
  }, [row, pkgInfo]);

  const fullyClaimed = derivedFullyClaimed || amountBasedFullyClaimed;

  // 🔎 Extra debug line combining both
  useEffect(() => {
    if (Number(row.stakeIndex) === 11) {
      console.log(
        "[stake#11] fullyClaimed →",
        fullyClaimed,
        "| derived:", derivedFullyClaimed,
        "| amountBased:", amountBasedFullyClaimed
      );
    }
  }, [fullyClaimed, derivedFullyClaimed, amountBasedFullyClaimed, row.stakeIndex]);

  // ==== Availability rules ====
  const canClaim = useMemo(() => {
    if (row.status !== "Active") return false;
    if (!pkgInfo) return false;
    if (!pkgInfo.isActive) return false;

    // 🚫 New: if fully claimed, hard-disable
    if (fullyClaimed) return false;

    // Then apply timing rules (unchanged)
    const startSec =
      typeof (row as any).startTs === "number" && (row as any).startTs > 0
        ? (row as any).startTs
        : (row.startDate ? Math.floor(row.startDate.getTime() / 1000) : 0);
    if (startSec <= 0) return false;

    const nowSec = Math.floor(Date.now() / 1000);

    if (pkgInfo.monthlyAPRClaimable) {
      const interval = Number(pkgInfo.claimableInterval || 0);
      if (interval <= 0) return false;

      const nextClaimSec =
        typeof (row as any).nextClaimAt === "number"
          ? (row as any).nextClaimAt
          : row.nextClaimWindow instanceof Date
          ? Math.floor(row.nextClaimWindow.getTime() / 1000)
          : startSec + interval;

      return nowSec >= nextClaimSec;
    }

    // Non-monthly → only at maturity
    const days = Number(pkgInfo.durationInDays || 0);
    if (days <= 0) return false;
    const maturity = startSec + days * 86400;
    return nowSec >= maturity;
  }, [pkgInfo, row.status, row.startDate, (row as any).startTs, row.nextClaimWindow, (row as any).nextClaimAt, fullyClaimed]);

  const canUnstake = useMemo(() => {
    if (row.status !== "Active") return false;
    if (!pkgInfo) return false;
    if (!pkgInfo.isActive) return false;
    if (derivedFullyUnstaked) return false;
    if (Boolean(pkgInfo.principalLocked)) return false;

    const startSec =
      typeof (row as any).startTs === "number" && (row as any).startTs > 0
        ? (row as any).startTs
        : (row.startDate ? Math.floor(row.startDate.getTime() / 1000) : 0);
    if (startSec <= 0) return false;

    const nowSec = Math.floor(Date.now() / 1000);

    if (Boolean(pkgInfo.monthlyUnstake)) {
      const intervalSec = Number(pkgInfo.claimableInterval || 0);
      if (intervalSec <= 0) return false;

      const nextCycleSec =
        typeof (row as any).nextClaimAt === "number"
          ? (row as any).nextClaimAt
          : row.nextClaimWindow instanceof Date
          ? Math.floor(row.nextClaimWindow.getTime() / 1000)
          : startSec + intervalSec;

      return nowSec >= nextCycleSec;
    }

    const days = Number(pkgInfo.durationInDays || 0);
    if (days <= 0) return false;

    const endSec = startSec + days * 86400;
    return nowSec >= endSec;
  }, [pkgInfo, row.status, row.startDate, (row as any).startTs, row.nextClaimWindow, (row as any).nextClaimAt, derivedFullyUnstaked]);

  // === Labels & reasons ===
  const claimLabel = useMemo(() => (confirming === "claim" ? "Confirming…" : claimPending ? "Processing…" : "Claim"), [claimPending, confirming]);
  const unstakeLabel = useMemo(() => (confirming === "unstake" ? "Confirming…" : unstakePending ? "Processing…" : "Unstake"), [unstakePending, confirming]);

  function mapDecodedError(name: string): string | null {
    switch (name) {
      case "APRNotYetClaimable": return "Not yet claimable. Please try again at your next claim window.";
      case "APRAlreadyClaimed":  return "All APR for this stake has already been claimed.";
      case "ZeroRewardAmount":   return "No reward available for this window.";
      case "InactivePackage":    return "This package is not active.";
      default: return null;
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
    return (err as any)?.message || "Transaction failed";
  }

  // === Actions ===
  async function handleClaim() {
    setLocalErr(null);

    // Optional pre-flight: if our derivation already says fully claimed, bail early
    if (fullyClaimed) {
      setLocalErr("APR fully claimed.");
      setTimeout(() => setLocalErr(null), 3000);
      return;
    }

    try {
      const args = [BigInt(row.stakeIndex)];
      const hash = await claimAprAsync({ address: PROXY, args });
      setConfirming("claim");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setConfirming(null);

      if (receipt.status !== "success") {
        try {
          const tx = await publicClient.getTransaction({ hash });
          await publicClient.call({ to: tx.to!, data: tx.input as `0x${string}`, value: tx.value, account: tx.from, blockNumber: receipt.blockNumber });
          setLocalErr("Transaction reverted (no reason provided)");
        } catch (e) {
          setLocalErr(prettyError(e));
        }
        setTimeout(() => setLocalErr(null), 6000);
        return;
      }

      // Refresh snapshot + notify UI
      await fetchStake();
      window.dispatchEvent(new Event("staking:updated"));
      if (onClaim) await onClaim();
    } catch (e: any) {
      setConfirming(null);
      setLocalErr(e?.message ? String(e.message) : prettyError(e));
      setTimeout(() => setLocalErr(null), 6000);
    }
  }

  async function handleUnstake() {
    setLocalErr(null);

    // Pre-flight: if fully unstaked already, abort
    if (derivedFullyUnstaked) {
      setLocalErr("Stake fully unstaked.");
      setTimeout(() => setLocalErr(null), 3000);
      return;
    }

    try {
      const args = [BigInt(row.stakeIndex)];
      const hash = await unstakeAsync({ address: PROXY, args });
      setConfirming("unstake");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setConfirming(null);

      if (receipt.status !== "success") {
        try {
          const tx = await publicClient.getTransaction({ hash });
          await publicClient.call({ to: tx.to!, data: tx.input as `0x${string}`, value: tx.value, account: tx.from, blockNumber: receipt.blockNumber });
          setLocalErr("Transaction reverted (no reason provided)");
        } catch (e) {
          setLocalErr(prettyError(e));
        }
        setTimeout(() => setLocalErr(null), 6000);
        return;
      }

      // Refresh snapshot + notify UI
      await fetchStake();
      window.dispatchEvent(new Event("staking:updated"));
      if (onUnstake) await onUnstake();
    } catch (e: any) {
      setConfirming(null);
      setLocalErr(e?.message ? String(e.message) : prettyError(e));
      setTimeout(() => setLocalErr(null), 6000);
    }
  }

  const claimDisabledReason = useMemo(() => {
    if (!pkgInfo) return "Loading package rules…";
    if (!pkgInfo.isActive) return "Package is inactive";
    if (fullyClaimed) return "APR fully claimed";

    const startSec =
      typeof (row as any).startTs === "number" && (row as any).startTs > 0
        ? (row as any).startTs
        : (row.startDate ? Math.floor(row.startDate.getTime() / 1000) : 0);
    if (startSec <= 0) return "Stake start time unavailable";

    if (pkgInfo.monthlyAPRClaimable) {
      const interval = Number(pkgInfo.claimableInterval || 0);
      if (interval <= 0) return "Claim interval not configured";
      const nextClaimSec =
        typeof (row as any).nextClaimAt === "number"
          ? (row as any).nextClaimAt
          : row.nextClaimWindow instanceof Date
          ? Math.floor(row.nextClaimWindow.getTime() / 1000)
          : startSec + interval;
      if (Date.now() / 1000 < nextClaimSec) return `Next claim: ${fmtDateTimeSeconds(new Date(nextClaimSec * 1000))}`;
      return "";
    } else {
      const days = Number(pkgInfo.durationInDays || 0);
      if (days <= 0) return "Maturity not configured";
      const maturity = startSec + days * 86400;
      if (Date.now() / 1000 < maturity) return `Claim at maturity: ${fmtDateTimeSeconds(new Date(maturity * 1000))}`;
      return "";
    }
  }, [pkgInfo, row.startDate, (row as any).startTs, row.nextClaimWindow, (row as any).nextClaimAt, fullyClaimed]);

  const unstakeDisabledReason = useMemo(() => {
    if (!pkgInfo) return "Loading package rules…";
    if (!pkgInfo.isActive) return "Package is inactive";
    if (derivedFullyUnstaked) return "Stake fully unstaked";
    if (pkgInfo.principalLocked) return "Principal is locked; unstake disabled";

    const startSec =
      typeof (row as any).startTs === "number" && (row as any).startTs > 0
        ? (row as any).startTs
        : (row.startDate ? Math.floor(row.startDate.getTime() / 1000) : 0);
    if (startSec <= 0) return "Stake start time unavailable";

    const nowSec = Math.floor(Date.now() / 1000);

    if (pkgInfo.monthlyUnstake) {
      const interval = Number(pkgInfo.claimableInterval || 0);
      if (interval <= 0) return "Unstake interval not configured";
      const next = startSec + interval;
      if (nowSec < next) {
        const mp = Number(pkgInfo.monthlyPrincipalReturnPercent || 0);
        const tail = mp > 0 ? ` (${mp}% principal per cycle)` : "";
        return `Unstake available at: ${fmtDateTimeSeconds(new Date(next * 1000))}${tail}`;
      }
      return "";
    }

    const days = Number(pkgInfo.durationInDays || 0);
    if (days <= 0) return "Unstake rules unavailable";
    const endSec = startSec + days * 86400;
    if (nowSec < endSec) return `Unstake at maturity: ${fmtDateTimeSeconds(new Date(endSec * 1000))}`;
    return "";
  }, [pkgInfo, row.startDate, (row as any).startTs, derivedFullyUnstaked]);

  const claimIsDisabled = claimPending || confirming !== null || !canClaim;
  const unstakeIsDisabled = unstakePending || confirming !== null || !canUnstake;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">

        {/* Claim */}
        <ResponsiveDisabledHint disabled={claimIsDisabled} reason={claimIsDisabled ? claimDisabledReason : undefined} className="inline-block">
          <button
            disabled={claimIsDisabled}
            onClick={handleClaim}
            className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium " +
                       "bg-emerald-500 hover:bg-emerald-600 text-white " +
                       "disabled:opacity-60 disabled:cursor-not-allowed " +
                       (claimIsDisabled ? "pointer-events-none" : "")}>
            <span className="opacity-90"><IconBolt /></span>
            {confirming === "claim" ? "Confirming…" : claimPending ? "Processing…" : "Claim"}
          </button>
        </ResponsiveDisabledHint>

        {/* Unstake */}
        <ResponsiveDisabledHint disabled={unstakeIsDisabled} reason={unstakeIsDisabled ? unstakeDisabledReason : undefined} className="inline-block">
          <button
            disabled={unstakeIsDisabled}
            onClick={handleUnstake}
            className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium " +
                       "bg-red-500 hover:bg-red-600 text-white " +
                       "disabled:opacity-60 disabled:cursor-not-allowed " +
                       (unstakeIsDisabled ? "pointer-events-none" : "")}>
            <span className="opacity-90"><IconLock /></span>
            {confirming === "unstake" ? "Confirming…" : unstakePending ? "Processing…" : "Unstake"}
          </button>
        </ResponsiveDisabledHint>

      </div>

      {localErr && <div className="text-xs text-red-300">{localErr}</div>}
    </div>
  );
};
