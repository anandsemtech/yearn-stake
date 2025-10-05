// src/components/PackageCards.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Lock, RefreshCcw } from "lucide-react";
import { formatEther } from "viem";

import { getColorClasses } from "@/common/helper";
import { useWallet } from "@/contexts/WalletContext";

// ⬇️ Uses your existing graphql-request client
import { subgraph } from "@/lib/subgraph"; // <-- adjust path if needed

export interface PackageData {
  id: string;
  name: string;           // not shown anymore (kept for compatibility)
  durationYears: number;
  minAmount: number;
  apy: number;
  color: string;          // feeds getColorClasses
  tag?: string;           // e.g. "Popular"
}

interface PackageCardsProps {
  onStakePackage: (packageData: PackageData) => void;
  onClaim?: (stakeIndex: string) => void;
  onUnstake?: (stakeIndex: string) => void;
}

/** Consistent color pick from id */
function colorFromId(id: string) {
  const palette = ["blue", "purple", "green", "orange"] as const;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

/* ---------- UI atoms ---------- */
const YY: React.FC<{ className?: string; title?: string }> = ({
  className = "w-4 h-4",
  title = "Yearn",
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="16" opacity="0.7" />
    <path d="M100 160 V90 M100 90 L60 40 M100 90 L140 40" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
  </svg>
);

const YYAmount: React.FC<{ value: number; className?: string }> = ({ value, className = "text-white/70" }) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <YY className="w-3.5 h-3.5 shrink-0" />
    <span className="tabular-nums">{value.toLocaleString()}</span>
  </span>
);

const TagChip: React.FC<{ label: string; gradient: string }> = ({ label, gradient }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-r ${gradient} shadow-[0_6px_16px_rgba(0,0,0,.35)] ring-1 ring-black/20`}>
    {label}
  </span>
);

const AccentBar: React.FC<{ gradient: string }> = ({ gradient }) => (
  <div className={`h-[6px] w-full rounded-full bg-gradient-to-r ${gradient} opacity-90`} />
);

const StatRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-[13px] sm:text-sm">
    <span className="text-white/60">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

/* -------------------------------- */

type RawPackage = {
  id: number;                        // uint16
  durationInDays: number;            // uint16
  apr: number;                       // uint16 (basis points)
  monthlyUnstake: boolean;
  isActive: boolean;
  minStakeAmount: bigint;            // uint256
  monthlyPrincipalReturnPercent: number; // uint16
  monthlyAPRClaimable: boolean;
  claimableInterval: bigint;         // uint256 (seconds)
  stakeMultiple: bigint;             // uint256
  principalLocked: boolean;
};

// Shape for cache storage (bigints as strings)
type CachedPackage = Omit<RawPackage, "minStakeAmount" | "claimableInterval" | "stakeMultiple"> & {
  minStakeAmount: string;
  claimableInterval: string;
  stakeMultiple: string;
};

type PackagesCache = {
  updatedAt: number;           // epoch ms
  items: CachedPackage[];
};

const CACHE_KEY = "yy_packages_cache_v1";

// GraphQL query (fetch ALL, filter active client-side for reliability)
const Q_PACKAGES = /* GraphQL */ `
  query Packages {
    packages(orderBy: packageId, orderDirection: asc) {
      packageId
      durationInDays
      aprBps
      monthlyUnstake
      isActive
      minStakeAmount
      monthlyPrincipalReturnPercent
      monthlyAPRClaimable
      claimableInterval
      stakeMultiple
      principalLocked
    }
  }
`;

const PackageCards: React.FC<PackageCardsProps> = ({ onStakePackage /*, onClaim, onUnstake */ }) => {
  const { user } = useWallet(); // kept in case you still need it for button states, etc.

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rawPackages, setRawPackages] = useState<RawPackage[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // ---------- Cache helpers ----------
  const readCache = (): { items: RawPackage[]; updatedAt: number | null } => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return { items: [], updatedAt: null };
      const cache: PackagesCache = JSON.parse(raw);
      const items: RawPackage[] = (cache.items || []).map((p) => ({
        ...p,
        minStakeAmount: BigInt(p.minStakeAmount),
        claimableInterval: BigInt(p.claimableInterval),
        stakeMultiple: BigInt(p.stakeMultiple),
      }));
      return { items, updatedAt: cache.updatedAt || null };
    } catch {
      return { items: [], updatedAt: null };
    }
  };

  const writeCache = (items: RawPackage[]) => {
    const now = Date.now();
    const cache: PackagesCache = {
      updatedAt: now,
      items: items.map((p) => ({
        ...p,
        minStakeAmount: p.minStakeAmount.toString(),
        claimableInterval: p.claimableInterval.toString(),
        stakeMultiple: p.stakeMultiple.toString(),
      })),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    setLastUpdated(now);
  };

  // ---------- Refresh (manual or first-load fallback) ----------
  const refresh = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await subgraph.request<{ packages: any[] }>(Q_PACKAGES);
      const rows = (res?.packages ?? []).filter((p) => p.isActive === true);

      const pkgs: RawPackage[] = rows.map((p) => ({
        id: Number(p.packageId),
        durationInDays: Number(p.durationInDays),
        apr: Number(p.aprBps), // basis points
        monthlyUnstake: Boolean(p.monthlyUnstake),
        isActive: Boolean(p.isActive),
        minStakeAmount: BigInt(p.minStakeAmount),
        monthlyPrincipalReturnPercent: Number(p.monthlyPrincipalReturnPercent),
        monthlyAPRClaimable: Boolean(p.monthlyAPRClaimable),
        claimableInterval: BigInt(p.claimableInterval),
        stakeMultiple: BigInt(p.stakeMultiple),
        principalLocked: Boolean(p.principalLocked),
      }));

      setRawPackages(pkgs);
      writeCache(pkgs);
    } catch (e: any) {
      setLoadError(e?.message ?? "Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- On mount: read cache; if empty, auto-refresh once ----------
  useEffect(() => {
    const { items, updatedAt } = readCache();
    setRawPackages(items);
    setLastUpdated(updatedAt);

    if (items.length === 0) {
      // First visit with no cache -> fetch once automatically
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map to UI shape
  const availablePackages: PackageData[] = useMemo(() => {
    return rawPackages.map((p) => {
      const apyPercent = p.apr / 100; // bps → percent
      const durationYears = Math.max(1, Math.round(p.durationInDays / 365));

      let minAmount = 0;
      try {
        minAmount = Number(formatEther(p.minStakeAmount));
      } catch {
        // ignore parse errors
      }

      return {
        id: String(p.id),
        name: `${durationYears} Year Package`,
        durationYears,
        minAmount,
        apy: apyPercent,
        color: colorFromId(String(p.id)),
        tag: "Popular",
      } as PackageData;
    });
  }, [rawPackages]);

  const lastUpdatedText =
    lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never";

  return (
    <div className="space-y-10">
      {/* Header row with Refresh + last updated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">
            Last updated: <span className="text-white/70">{lastUpdatedText}</span>
          </span>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 ring-1 ring-white/15 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Available Packages */}
      <div>
        {isLoading && rawPackages.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-white/70">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-white/60 mr-3" />
            Loading packages…
          </div>
        ) : loadError && rawPackages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-500/30 p-6 text-rose-300">
            Failed to load packages: {loadError}
          </div>
        ) : availablePackages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-white/70">
            No active packages found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {availablePackages.map((pkg) => {
              const gradient = getColorClasses(pkg.color);
              const monthlyAprOn1000 = ((1000 * pkg.apy) / 12) / 100; // per month on 1,000 units
              const years = pkg.durationYears;

              return (
                <div
                  key={pkg.id}
                  className="
                    relative overflow-hidden rounded-3xl p-5
                    bg-white/5 ring-1 ring-white/10
                    shadow-[0_8px_40px_-8px_rgba(0,0,0,.35)]
                    hover:shadow-[0_12px_50px_-6px_rgba(0,0,0,.45)]
                    transition-all
                  "
                >
                  {/* top accent */}
                  <AccentBar gradient={gradient} />

                  {/* header: tag + apy pill */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="min-w-0">
                      {pkg.tag && <TagChip label={pkg.tag} gradient={gradient} />}
                    </div>
                    <div className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r ${gradient} text-white/95 ring-1 ring-black/20 shadow-inner`}>
                      <span className="opacity-85">APY</span>
                      <span className="tabular-nums">{pkg.apy}%</span>
                    </div>
                  </div>

                  {/* hero duration */}
                  <div className="mt-4 flex items-end justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-[42px] leading-none font-extrabold text-white tabular-nums">
                        {years}
                      </span>
                      <span className="text-white/70 font-semibold text-base sm:text-lg">
                        {years === 1 ? "Year" : "Years"}
                      </span>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="mt-5 space-y-2.5">
                    <StatRow label="Min Amount" value={<YYAmount value={pkg.minAmount} className="text-white/70" />} />
                    <div className="pt-2 text-xs inline-flex items-center gap-1.5 text-white/60">
                      <span>≈</span>
                      <YYAmount value={Number(monthlyAprOn1000.toFixed(2))} className="text-white/65" />
                      <span>/ month on</span>
                      <span className="inline-flex items-center gap-1.5 text-white/60">
                        <YY className="w-3.5 h-3.5" />
                        <span className="tabular-nums">1,000</span>
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => onStakePackage(pkg)}
                    className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${gradient} hover:opacity-95 active:opacity-90 transition transform hover:scale-[1.02]`}
                  >
                    <Lock className="w-4 h-4" />
                    Stake Now
                  </button>

                  {/* soft glows */}
                  <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-14 -left-10 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Packages (my account) — disabled to ensure only one subgraph call) */}
      {/*
      <ActivePackages
        activePackages={user?.activePackages || []}
        onClaim={onClaim}
        onUnstake={onUnstake}
      />
      */}
    </div>
  );
};

export default PackageCards;
