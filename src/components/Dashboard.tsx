// src/components/Dashboard.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { useWallet } from "../contexts/hooks/useWallet";
import EarningsClaimPanel from "./EarningsClaimPanel";
import EventLogs from "./EventLogs";
import LeaderBoard from "./LeaderBoard";
import PackageCards, { PackageData } from "./PackageCards";
import StakingModal from "./StakingModal";
import { StarLevelProgress } from "./StarLevel";
import StatsOverview from "./StatsOverview";
import ActivePackages from "./ActivePackages";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import ClaimsHubPanel from "@/components/ClaimsHubPanel";
import type { ActivePackage } from "@/contexts/WalletContext";

import HonoraryNftPopup from "./HonoraryNftPopup";
import { useHonoraryNft } from "../hooks/useHonoraryNft";

/* =====================
   Config / Helpers
===================== */
const stakingContract = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? "") as Address;
const HONORARY_NFT_ADDRESS = (import.meta.env.VITE_HONORARY_NFT_ADDRESS ?? "") as Address;
const BUDDY_NFT_ADDRESS = (import.meta.env.VITE_BUDDY_NFT_ADDRESS ?? "") as Address;

const DEBUG_PACKAGES = Boolean(import.meta.env.VITE_DEBUG_PACKAGES);

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

const DEPLOY_BLOCK_STR = import.meta.env.VITE_DEPLOY_BLOCK as string | undefined;
const DEPLOY_BLOCK = DEPLOY_BLOCK_STR ? (BigInt(DEPLOY_BLOCK_STR) as bigint) : undefined;


// small reusable glass panel (no extra files needed)
const GlassPanel: React.FC<React.PropsWithChildren<{ title?: string; className?: string }>> = ({
  title,
  className,
  children,
}) => (
  <section
    className={[
      "relative rounded-3xl p-5 sm:p-6",
      "bg-white/10 backdrop-blur-xl",
      "border border-white/10 ring-1 ring-white/15 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]",
      className || "",
    ].join(" ")}
  >
    <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
         style={{ background: "linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.02))" }} />
    {title ? <h2 className="text-lg font-semibold text-white mb-4 relative">{title}</h2> : null}
    <div className="relative">{children}</div>
  </section>
);

// wei → human (18d), trimmed, capped fractional digits, no unit.
function formatAmount18(v: bigint, maxFrac = 6): string {
  const s = formatUnits(v, 18);
  if (!s.includes(".")) {
    const n = Number(s);
    return Number.isFinite(n) ? n.toLocaleString() : s;
  }
  const [whole, fracRaw] = s.split(".");
  const frac = fracRaw.slice(0, maxFrac).replace(/0+$/, "");
  const wholeNum = Number(whole);
  const wholeStr = Number.isFinite(wholeNum) ? wholeNum.toLocaleString() : whole;
  return frac ? `${wholeStr}.${frac}` : wholeStr;
}

// Minimal toast (unchanged)
const Toast: React.FC<{ show: boolean; title: string; message?: string; onClose: () => void }> = ({
  show,
  title,
  message,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div className="rounded-xl bg-white/10 backdrop-blur-xl shadow-lg border border-white/15 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-300">
              ✓
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{title}</div>
            {message ? <div className="text-xs text-white/80 mt-0.5">{message}</div> : null}
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/90 text-sm"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================
   Component
===================== */
const Dashboard: React.FC = () => {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  const { user } = useWallet();

  // Wallet / chain
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  // Honorary NFT detection
  const { badges, show, dismiss, dontAskAgain, loading: honLoading, error: honError } = useHonoraryNft({
    owner: address ?? null,
    contracts: [
      { address: HONORARY_NFT_ADDRESS, label: "YearnChamp", tokenId: 0n, imageOverride: "/images/YearnChamp.gif" },
      { address: BUDDY_NFT_ADDRESS, label: "YearnBuddy", tokenId: 0n, imageOverride: "/images/YearnBuddy.gif" },
    ],
  });

  // ----------------------------
  // Active Packages state
  // ----------------------------
  const [activePackages, setActivePackages] = useState<ActivePackage[]>([]);
  const [isLoadingActive, setIsLoadingActive] = useState<boolean>(true);

  const dateFromSeconds = (sec?: number | bigint): Date | undefined => {
    if (sec == null) return undefined;
    const n = typeof sec === "bigint" ? Number(sec) : sec;
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return new Date(n * 1000);
  };

  const fetchActivePackages = useCallback(async () => {
    if (!publicClient || !address || !stakingContract) {
      setActivePackages([]);
      setIsLoadingActive(false);
      return;
    }

    try {
      setIsLoadingActive(true);

      const stakeCount = (await publicClient.readContract({
        address: stakingContract,
        abi: STAKING_ABI as any,
        functionName: "userStakeCounts",
        args: [address],
      })) as bigint;

      const countNum = Number(stakeCount || 0n);
      if (!Number.isFinite(countNum) || countNum <= 0) {
        setActivePackages([]);
        return;
      }

      const rows: ActivePackage[] = [];
      const pkgCache = new Map<
        number,
        {
          claimableInterval?: bigint;
          durationInDays?: bigint;
          isActive?: boolean;
          aprBps?: bigint;
        }
      >();

      for (let i = 0; i < countNum; i++) {
        const s: any = await publicClient.readContract({
          address: stakingContract,
          abi: STAKING_ABI as any,
          functionName: "userStakes",
          args: [address, BigInt(i)],
        });

        const totalStaked: bigint =
          (typeof s?.totalStaked === "bigint" ? s.totalStaked : undefined) ?? (Array.isArray(s) ? (s[0] as bigint) : 0n);
        const startTimeSec: number =
          (typeof s?.startTime === "bigint" ? Number(s.startTime) : undefined) ?? (Array.isArray(s) ? Number(s[3]) : 0);
        const pkgIdNum: number =
          (typeof s?.packageId === "number" ? s.packageId : undefined) ??
          (typeof s?.packageId === "bigint" ? Number(s.packageId) : undefined) ??
          (Array.isArray(s) ? Number(s[6]) : 0);
        const isFullyUnstaked: boolean =
          (typeof s?.isFullyUnstaked === "boolean" && s.isFullyUnstaked) || (Array.isArray(s) ? Boolean(s[7]) : false);

        if (isFullyUnstaked) continue;

        // cached package info
        let pkgInfo = pkgCache.get(pkgIdNum);
        if (!pkgInfo) {
          const p: any = await publicClient.readContract({
            address: stakingContract,
            abi: STAKING_ABI as any,
            functionName: "packages",
            args: [BigInt(pkgIdNum)],
          });
          const durationInDays: bigint | undefined = Array.isArray(p) ? BigInt(p[1]) : undefined;
          const isActive: boolean | undefined = Array.isArray(p) ? Boolean(p[4]) : undefined;
          const aprBps: bigint | undefined = Array.isArray(p) ? BigInt(p[2]) : undefined;
          const claimableInterval: bigint | undefined = Array.isArray(p) ? (p[8] as bigint) : undefined;
          pkgInfo = { claimableInterval, durationInDays, isActive, aprBps };
          pkgCache.set(pkgIdNum, pkgInfo);
        }

        const nextClaimSec = (await publicClient.readContract({
          address: stakingContract,
          abi: STAKING_ABI as any,
          functionName: "getNextClaimTime",
          args: [address, BigInt(i)],
        })) as bigint;

        const nextClaimWindow = nextClaimSec && nextClaimSec > 0n ? dateFromSeconds(nextClaimSec) : undefined;
        const aprPct = typeof pkgInfo?.aprBps === "bigint" ? Number(pkgInfo.aprBps) / 100 : undefined;

        rows.push({
          id: String(i),
          packageName: `1 Year Package`,
          amount: formatAmount18(totalStaked),
          startDate: dateFromSeconds(startTimeSec) ?? new Date(0),
          nextClaimWindow,
          status: pkgInfo?.isActive ? "Active" : "Inactive",
          stakeIndex: String(i),
          packageId: pkgIdNum,
          aprPct,
        });
      }

      rows.sort((a, b) => (b.startDate?.getTime?.() ?? 0) - (a.startDate?.getTime?.() ?? 0));
      setActivePackages(rows);
    } catch (err) {
      console.error("[fetchActivePackages] failed:", err);
      setActivePackages([]);
    } finally {
      setIsLoadingActive(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    fetchActivePackages();
  }, [fetchActivePackages, address, chainId]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const handler = async () => {
      await fetchActivePackages();
      setToastTitle("Transaction confirmed");
      setToastMsg("Active Packages refreshed.");
      setToastOpen(true);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastOpen(false), 4000);
    };
    window.addEventListener("staking:updated", handler as EventListener);
    return () => {
      window.removeEventListener("staking:updated", handler as EventListener);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [fetchActivePackages]);

  const handleStakePackage = (packageData: PackageData) => {
    setSelectedPackage(packageData);
    setShowStakingModal(true);
  };

  /* =====================
     Render
  ===================== */
  return (
    // page shell with subtle gradient glow → instant glassy vibe
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
                    bg-[radial-gradient(1100px_600px_at_50%_-200px,rgba(125,106,255,0.12),transparent)]
                    bg-[length:100%_auto]">
      {/* Honorary NFT popup — ONLY when holder */}
      {show && badges.some(b => b.owned) && (
        <HonoraryNftPopup
          items={badges.filter(b => b.owned).map(b => ({
            title: b.label,
            imageUrl: b.imageUrl || "/images/placeholder.png",
            address: b.address,
          }))}
          onClose={dismiss}
          onDontAskAgainAll={() => dontAskAgain("all")}
          onDontAskAgainSelected={(addresses) => dontAskAgain(addresses)}
        />
      )}
      {honError && <div className="text-red-400 text-xs">Honorary NFT: {honError}</div>}
      {honLoading && <div className="text-xs opacity-70">Checking honorary status…</div>}

      {/* Toast */}
      <Toast show={toastOpen} title={toastTitle} message={toastMsg} onClose={() => setToastOpen(false)} />

      {/* Overview */}
      <GlassPanel title="Your Staking Dashboard">
        <StatsOverview />
      </GlassPanel>

      {/* Available Packages */}
      <GlassPanel title="Available Packages" className="mt-8">
        <PackageCards onStakePackage={handleStakePackage} />
      </GlassPanel>

      {/* Active Packages */}
      <GlassPanel title="Active Packages" className="mt-8">
        <ActivePackages
          activePackages={activePackages}
          isLoading={isLoadingActive}
          renderWhenEmpty={true}
          onClaim={async () => { await fetchActivePackages(); }}
          onUnstake={async () => { await fetchActivePackages(); }}
        />
      </GlassPanel> 

      {/* Earnings / Affiliate / Events */}
      <div className="mt-8 grid grid-cols-1 gap-8">
        <GlassPanel title="Earnings">
          <EarningsClaimPanel />
        </GlassPanel>

        <ClaimsHubPanel proxy={PROXY as Address} deployBlock={DEPLOY_BLOCK} />


        <GlassPanel title="Affiliate Journey">
          <StarLevelProgress
            currentLevel={user?.starLevel || 0}
            currentVolume={user?.totalVolume || 15000}
            currentReferrals={user?.totalReferrals || 12}
            directReferrals={user?.directReferrals || 3}
            levelUsers={user?.levelUsers || { 1: 0, 2: 0, 3: 0, 4: 0 }}
            isGoldenStar={user?.isGoldenStar || false}
            goldenStarProgress={user?.goldenStarProgress || 0}
          />
        </GlassPanel>

       {/* <GlassPanel title="Activity">
          <EventLogs />
        </GlassPanel>*/}
      </div>

      {showStakingModal && selectedPackage && (
        <StakingModal
          package={selectedPackage}
          onClose={() => {
            setShowStakingModal(false);
            setSelectedPackage(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
