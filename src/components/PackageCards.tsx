// src/components/PackageCards.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";

import { getColorClasses } from "@/common/helper";
import { useWallet } from "@/contexts/WalletContext";
import ActivePackages from "@/components/ActivePackages";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

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

/** Monochrome, dimmable Yearn logo (upright Y). Inherits color from parent via currentColor. */
const YY: React.FC<{ className?: string; title?: string }> = ({
  className = "w-4 h-4",
  title = "Yearn",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label={title}
  >
    {/* ring */}
    <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="16" opacity="0.7" />
    {/* Y */}
    <path
      d="M100 160 V90 M100 90 L60 40 M100 90 L140 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

/** Amount with Yearn icon; uses tabular-nums for perfect alignment */
const YYAmount: React.FC<{ value: number; className?: string }> = ({
  value,
  className = "text-white/70",
}) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <YY className="w-3.5 h-3.5 shrink-0" />
    <span className="tabular-nums">{value.toLocaleString()}</span>
  </span>
);

const TagChip: React.FC<{ label: string; gradient: string }> = ({ label, gradient }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white
                bg-gradient-to-r ${gradient} shadow-[0_6px_16px_rgba(0,0,0,.35)] ring-1 ring-black/20`}
  >
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

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

type RawPackage = {
  id: number;                        // uint16
  durationInDays: number;            // uint16
  apr: number;                       // uint16 (basis points)
  monthlyUnstake: boolean;
  isActive: boolean;
  minStakeAmount: bigint;            // uint256
  monthlyPrincipalReturnPercent: number; // uint16 (basis points of principal per "month" interval)
  monthlyAPRClaimable: boolean;
  claimableInterval: bigint;         // uint256 (seconds)
  stakeMultiple: bigint;             // uint256
  principalLocked: boolean;
};

const PackageCards: React.FC<PackageCardsProps> = ({
  onStakePackage,
  onClaim,
  onUnstake,
}) => {
  const publicClient = usePublicClient();
  const { user } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [rawPackages, setRawPackages] = useState<RawPackage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---- Load packages from chain (no subgraph) ----
  useEffect(() => {
    let cancelled = false;

    async function loadOnChainPackages() {
      if (!publicClient || !PROXY) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        // 1) Read nextPackageId to know how many packages exist
        const nextPackageId = (await publicClient.readContract({
          address: PROXY,
          abi: STAKING_ABI,
          functionName: "nextPackageId",
        })) as bigint;

        const count = Number(nextPackageId ?? 0n);
        if (count === 0) {
          if (!cancelled) setRawPackages([]);
          return;
        }

        // 2) Multicall getPackageDetails for all ids
        const ids = Array.from({ length: count }, (_, i) => i);
        const calls = ids.map((id) => ({
          address: PROXY,
          abi: STAKING_ABI,
          functionName: "getPackageDetails",
          args: [BigInt(id)],
        }) as const);

        const responses = await publicClient.multicall({ contracts: calls });

        const pkgs: RawPackage[] = [];
        responses.forEach((res, i) => {
          if (res.status !== "success" || !Array.isArray(res.result)) return;

          const [
            id,
            durationInDays,
            apr,
            monthlyUnstake,
            isActive,
            minStakeAmount,
            monthlyPrincipalReturnPercent,
            monthlyAPRClaimable,
            claimableInterval,
            stakeMultiple,
            principalLocked,
          ] = res.result as unknown as [
            number,
            number,
            number,
            boolean,
            boolean,
            bigint,
            number,
            boolean,
            bigint,
            bigint,
            boolean
          ];

          pkgs.push({
            id,
            durationInDays,
            apr,
            monthlyUnstake,
            isActive,
            minStakeAmount,
            monthlyPrincipalReturnPercent,
            monthlyAPRClaimable,
            claimableInterval,
            stakeMultiple,
            principalLocked,
          });
        });

        if (!cancelled) {
          // Keep only active packages, sort by id asc for stable UI
          setRawPackages(pkgs.filter((p) => p.isActive).sort((a, b) => a.id - b.id));
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message ?? "Failed to load packages");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOnChainPackages();
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  // ---- Map raw on-chain packages to UI-friendly shape used before ----
  const availablePackages: PackageData[] = useMemo(() => {
    return rawPackages.map((p) => {
      // apr is in basis points (e.g., 1200 = 12.00%)
      const apyPercent = p.apr / 100; // keep as number with 2 decimal precision naturally

      // Convert durationInDays -> rounded years (fallback to at least 1)
      const durationYears = Math.max(1, Math.round(p.durationInDays / 365));

      let minAmount = 0;
      try {
        minAmount = Number(formatEther(p.minStakeAmount));
      } catch {
        // ignore parse error; keep zero
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

  return (
    <div className="space-y-10">
      {/* Available Packages */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-white/70">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-white/60 mr-3" />
            Loading packages…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-dashed border-rose-500/30 p-6 text-rose-300">
            Failed to load packages from chain: {loadError}
          </div>
        ) : availablePackages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-white/70">
            No active packages found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {availablePackages.map((pkg) => {
              const gradient = getColorClasses(pkg.color); // e.g. "from-blue-500 to-cyan-600"
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
                    <div
                      className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
                                  bg-gradient-to-r ${gradient} text-white/95 ring-1 ring-black/20 shadow-inner`}
                    >
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
                    <StatRow
                      label="Min Amount"
                      value={<YYAmount value={pkg.minAmount} className="text-white/70" />}
                    />
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
                    className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white
                      bg-gradient-to-r ${gradient}
                      hover:opacity-95 active:opacity-90 transition transform hover:scale-[1.02]`}
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

      {/* Active Packages (my account) */}
      <ActivePackages
        activePackages={user?.activePackages || []}
        onClaim={onClaim}
        onUnstake={onUnstake}
      />
    </div>
  );
};

export default PackageCards;
