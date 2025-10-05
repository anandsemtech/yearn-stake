import React from "react";
import { useAccount } from "wagmi";
import LoadingActiveStakes from "./LoadingActiveStakes";
import { useActiveStakes } from "@/hooks/useActiveStakes";
import { buildActivePackagesColumns } from "./ActivePackagesColumns";

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
  const { rows, loading, error, refresh } = useActiveStakes({ address, ttlMs: 60_000 });

  // Always refresh the table after row-level actions, regardless of parent callbacks.
  const columns = buildActivePackagesColumns({
    onClaim: async () => {
      try { await onClaim?.(); } finally { await refresh(); }
    },
    onUnstake: async () => {
      try { await onUnstake?.(); } finally { await refresh(); }
    },
  });

  if (loading) return <LoadingActiveStakes />;
  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-500/30 p-6 text-rose-300">
        {error}
      </div>
    );
  }
  if (!rows.length) {
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
              {rows.map((row) => (
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

      {/* Mobile cards */}
      <div className="md:hidden -mx-4 px-4 mt-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
          {rows.map((row) => (
            <div key={row.id} className="snap-center shrink-0 w-[88%]">
              <div className="rounded-2xl p-4 bg-white/10 border border-white/20">
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
