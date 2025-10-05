import React, { useMemo, useState } from "react";
import type { ActivePackageRow } from "./ActivePackages";
import ResponsiveDisabledHint from "./ResponsiveDisabledHint";
import {
  useWriteYearnTogetherClaimApr,
  useWriteYearnTogetherUnstake,
} from "@/web3/__generated__/wagmi";
import { usePublicClient } from "wagmi";
import { explainTxError, normalizeEvmError, showEvmError, showUserSuccess } from "@/lib/errors";
import { bsc } from "viem/chains";

/* ---- Icons ---- */
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
const IconTrendUp = () => (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M16 6h5v5h-2V9.41l-5.29 5.3l-4-4L3 17.41L1.59 16L9.7 7.9l4 4L17.59 8H16z"/></svg>);
const IconClock = () => (<svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m.75 5h-1.5v6l5.25 3.15l.75-1.23l-4.5-2.67Z"/></svg>);
const IconBolt = () => (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>);
const IconLock = () => (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V6a3 3 0 0 0-3 3v3h6V6a3 3 0 0 0-3-3Z"/></svg>);

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

/* ---- helpers ---- */
const fmtDateTime = (d?: Date) =>
  d ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d) : "—";
const fmtDateTimeSeconds = (d?: Date) =>
  d ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Kolkata" }).format(d) : "—";

/* ---------------- Columns builder ---------------- */
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
          <span className="font-medium">
            {typeof r.aprPct === "number" ? `${r.aprPct.toFixed(2)}%` : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "start", header: "START DATE",
      render: (r: ActivePackageRow) => {
        const startDate = typeof r.startTs === "number" && r.startTs > 0 ? new Date(r.startTs * 1000) : r.startDate;
        return <span title={startDate ? startDate.toISOString() : "—"}>{fmtDateTimeSeconds(startDate)}</span>;
      },
    },
    {
      key: "next", header: "NEXT CLAIM",
      render: (r: ActivePackageRow) => {
        const when = fmtDateTime(r.nextClaimWindow);
        const available = r.nextClaimWindow ? r.nextClaimWindow.getTime() <= Date.now() : true;
        return available ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <span>●</span>
            <div className="flex flex-col">
              <span className="font-medium">Available now</span>
              <span className="text-xs opacity-80">{when}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>●</span>
            <span>{when}</span>
          </div>
        );
      },
    },
    {
      key: "status", header: "STATUS",
      render: (r: ActivePackageRow) => {
        const pkgActive = r.pkgRules?.isActive ?? (r.status === "Active");
        return (
          <span className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 " +
            (pkgActive ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                       : "bg-white/10 text-white/60 ring-white/15")
          }>
            <span className={"h-1.5 w-1.5 rounded-full " + (pkgActive ? "bg-emerald-400" : "bg-white/30")} />
            {pkgActive ? "active" : "inactive"}
          </span>
        );
      },
    },
    { key: "actions", header: "ACTIONS", render: (r: ActivePackageRow) => <RowActions row={r} onClaim={onClaim} onUnstake={onUnstake} /> },
  ];
}

/* ---------------- Row Actions (chain-bound to BSC) ---------------- */
const RowActions: React.FC<{
  row: ActivePackageRow;
  onClaim?: () => Promise<void> | void;
  onUnstake?: () => Promise<void> | void;
}> = ({ row, onClaim, onUnstake }) => {
  // Bind reads/receipt waits to BSC
  const publicClient = usePublicClient({ chainId: bsc.id });
  const { writeContractAsync: claimAprAsync, isPending: claimPending } = useWriteYearnTogetherClaimApr();
  const { writeContractAsync: unstakeAsync,   isPending: unstakePending } = useWriteYearnTogetherUnstake();

  const [localErr, setLocalErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"claim" | "unstake" | null>(null);

  const pkg = row.pkgRules;
  const nowSec = Math.floor(Date.now() / 1000);
  const startSec =
    typeof row.startTs === "number" && row.startTs > 0
      ? row.startTs
      : (row.startDate ? Math.floor(row.startDate.getTime() / 1000) : 0);

  const fullyUnstaked =
    Boolean(row.isFullyUnstaked) ||
    (row.principalWithdrawnWei != null && row.totalStakedWei != null && row.principalWithdrawnWei >= row.totalStakedWei);

  const amountFullyClaimed = (() => {
    if (!row.totalStakedWei || !row.claimedAprWei) return false;
    const aprBps = row.aprBps ?? pkg?.aprBps ?? 0;
    if (aprBps <= 0) return false;
    const cap = (row.totalStakedWei * BigInt(aprBps)) / 10000n;
    return row.claimedAprWei >= cap;
  })();

  const nextClaimSec =
    typeof row.nextClaimAt === "number" ? row.nextClaimAt
    : row.nextClaimWindow instanceof Date ? Math.floor(row.nextClaimWindow.getTime() / 1000)
    : (pkg?.monthlyAPRClaimable && pkg?.claimableIntervalSec && startSec > 0)
      ? startSec + pkg.claimableIntervalSec
      : 0;

  const canClaim = useMemo(() => {
    if (!pkg || !pkg.isActive) return false;
    if (amountFullyClaimed) return false;
    if (pkg.monthlyAPRClaimable) {
      if (!pkg.claimableIntervalSec) return false;
      return nowSec >= nextClaimSec;
    } else {
      if (!pkg.durationInDays) return false;
      const maturity = startSec + pkg.durationInDays * 86400;
      return nowSec >= maturity;
    }
  }, [pkg, amountFullyClaimed, nowSec, nextClaimSec, startSec]);

  const canUnstake = useMemo(() => {
    if (!pkg || !pkg.isActive) return false;
    if (fullyUnstaked) return false;
    if (pkg.principalLocked) return false;

    if (pkg.monthlyUnstake) {
      if (!pkg.claimableIntervalSec) return false;
      return nowSec >= (startSec + pkg.claimableIntervalSec);
    } else {
      if (!pkg.durationInDays) return false;
      const endSec = startSec + pkg.durationInDays * 86400;
      return nowSec >= endSec;
    }
  }, [pkg, fullyUnstaked, nowSec, startSec]);

  const claimDisabledReason = useMemo(() => {
    if (!pkg) return "Loading package rules…";
    if (!pkg.isActive) return "Package is inactive";
    if (amountFullyClaimed) return "APR fully claimed";
    if (pkg.monthlyAPRClaimable) {
      if (!pkg.claimableIntervalSec) return "Claim interval not configured";
      if (nowSec < nextClaimSec) return `Next claim: ${fmtDateTimeSeconds(new Date(nextClaimSec * 1000))}`;
      return "";
    } else {
      if (!pkg.durationInDays) return "Maturity not configured";
      const maturity = startSec + pkg.durationInDays * 86400;
      if (nowSec < maturity) return `Claim at maturity: ${fmtDateTimeSeconds(new Date(maturity * 1000))}`;
      return "";
    }
  }, [pkg, amountFullyClaimed, nowSec, nextClaimSec, startSec]);

  const unstakeDisabledReason = useMemo(() => {
    if (!pkg) return "Loading package rules…";
    if (!pkg.isActive) return "Package is inactive";
    if (fullyUnstaked) return "Stake fully unstaked";
    if (pkg.principalLocked) return "Principal is locked";
    if (pkg.monthlyUnstake) {
      if (!pkg.claimableIntervalSec) return "Unstake interval not configured";
      const next = startSec + pkg.claimableIntervalSec;
      if (nowSec < next) return `Unstake available at: ${fmtDateTimeSeconds(new Date(next * 1000))}`;
      return "";
    } else {
      if (!pkg.durationInDays) return "Unstake rules unavailable";
      const endSec = startSec + pkg.durationInDays * 86400;
      if (nowSec < endSec) return `Unstake at maturity: ${fmtDateTimeSeconds(new Date(endSec * 1000))}`;
      return "";
    }
  }, [pkg, fullyUnstaked, nowSec, startSec]);

  const claimLabel = confirming === "claim" ? "Confirming…" : claimPending ? "Processing…" : "Claim";
  const unstakeLabel = confirming === "unstake" ? "Confirming…" : unstakePending ? "Processing…" : "Unstake";

  async function handleClaim() {
    setLocalErr(null);
    if (!canClaim) {
      setLocalErr(claimDisabledReason || "Not claimable");
      setTimeout(() => setLocalErr(null), 4000);
      return;
    }
    try {
      const args = [BigInt(row.stakeIndex)];
      // 🔗 ensure writes are on BSC
      const hash = await claimAprAsync({ address: PROXY, args, chainId: bsc.id });
      setConfirming("claim");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setConfirming(null);

      if (receipt.status !== "success") {
        const appErr = explainTxError("claim", new Error("Transaction reverted"));
        window.dispatchEvent(new CustomEvent("toast:error", {
          detail: { title: appErr.title, description: appErr.message, severity: appErr.severity },
        }));
        setLocalErr(appErr.message);
        setTimeout(() => setLocalErr(null), 6000);
        return;
      }

      // 🔔 refresh listeners + success toast
      window.dispatchEvent(new Event("staking:updated"));
      window.dispatchEvent(new Event("active-packages:refresh"));
      window.dispatchEvent(new Event("stakes:changed"));
      window.dispatchEvent(new Event("apr:claimed"));
      showUserSuccess("Claim submitted", "We’ll update your earnings shortly.");

      if (onClaim) await onClaim();
    } catch (e: any) {
      setConfirming(null);
      showEvmError(e, { context: "Claim" });
      setLocalErr(normalizeEvmError(e).message);
      setTimeout(() => setLocalErr(null), 6000);
    }
  }

  async function handleUnstake() {
    setLocalErr(null);
    if (!canUnstake) {
      setLocalErr(unstakeDisabledReason || "Unstake not available");
      setTimeout(() => setLocalErr(null), 4000);
      return;
    }
    try {
      const args = [BigInt(row.stakeIndex)];
      // 🔗 ensure writes are on BSC
      const hash = await unstakeAsync({ address: PROXY, args, chainId: bsc.id });
      setConfirming("unstake");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setConfirming(null);

      if (receipt.status !== "success") {
        const appErr = explainTxError("unstake", new Error("Transaction reverted"));
        window.dispatchEvent(new CustomEvent("toast:error", {
          detail: { title: appErr.title, description: appErr.message, severity: appErr.severity },
        }));
        setLocalErr(appErr.message);
        setTimeout(() => setLocalErr(null), 6000);
        return;
      }

      // 🔔 refresh listeners + success toast
      window.dispatchEvent(new Event("staking:updated"));
      window.dispatchEvent(new Event("active-packages:refresh"));
      window.dispatchEvent(new Event("stakes:changed"));
      window.dispatchEvent(new Event("unstaked"));
      showUserSuccess("Unstake submitted", "We’ll refresh your positions shortly.");

      if (onUnstake) await onUnstake();
    } catch (e: any) {
      setConfirming(null);
      showEvmError(e, { context: "Unstake" });
      setLocalErr(normalizeEvmError(e).message);
      setTimeout(() => setLocalErr(null), 6000);
    }
  }

  const claimIsDisabled = claimPending || confirming !== null || !canClaim;
  const unstakeIsDisabled = unstakePending || confirming !== null || !canUnstake;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <ResponsiveDisabledHint disabled={claimIsDisabled} reason={claimIsDisabled ? claimDisabledReason : undefined} className="inline-block">
          <button
            disabled={claimIsDisabled}
            onClick={handleClaim}
            className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium " +
                       "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60 disabled:cursor-not-allowed " +
                       (claimIsDisabled ? "pointer-events-none" : "")}>
            <span className="opacity-90"><IconBolt /></span>
            {unstakePending && confirming !== "claim" ? "Processing…" : claimLabel}
          </button>
        </ResponsiveDisabledHint>

        <ResponsiveDisabledHint disabled={unstakeIsDisabled} reason={unstakeIsDisabled ? unstakeDisabledReason : undefined} className="inline-block">
          <button
            disabled={unstakeIsDisabled}
            onClick={handleUnstake}
            className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium " +
                       "bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 disabled:cursor-not-allowed " +
                       (unstakeIsDisabled ? "pointer-events-none" : "")}>
            <span className="opacity-90"><IconLock /></span>
            {claimPending && confirming !== "unstake" ? "Processing…" : unstakeLabel}
          </button>
        </ResponsiveDisabledHint>
      </div>

      {localErr && <div className="text-xs text-red-300">{localErr}</div>}
    </div>
  );
};
