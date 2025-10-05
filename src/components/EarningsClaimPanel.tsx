// src/components/EarningsClaimPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Award, Clock, Star, TrendingUp, Zap, RefreshCcw } from "lucide-react";
import { Address, formatUnits } from "viem";
import { bsc } from "viem/chains";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useWallet } from "@/contexts/hooks/useWallet";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import { useEarningsSG } from "@/hooks/useEarningsSG";
import { explainTxError, formatForUser, showUserError, showUserSuccess } from "@/lib/errors";

/* ===== Proxy (staking) address from env ===== */
const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

/* ---------- UI atoms ---------- */
const DarkCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <div
    className={[
      "rounded-2xl p-4 sm:p-5",
      "bg-gray-800 border border-gray-700 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)]",
      className || "",
    ].join(" ")}
  >
    {children}
  </div>
);

const Pill: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border",
      className || "",
    ].join(" ")}
  >
    {children}
  </span>
);

type EarningCard = {
  type: "referral" | "star" | "golden";
  title: string;
  available: number; // what user can claim now (display)
  lifetime?: number; // for “Total Earnings” (referral uses lifetime from SG)
  breakdown?: { y: number; s: number; p: number }; // referral chips
  nextClaim: Date | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: {
    iconBg: string;
    iconFg: string;
    chip: string;
    chipMuted: string;
    ring: string;
  };
  description: string;
  onClaim: () => Promise<unknown> | void;
  canWrite: boolean;
  pending: boolean;
  ok?: boolean;
};

const EarningsClaimPanel: React.FC = () => {
  const [claimingType, setClaimingType] = useState<string | null>(null);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: bsc.id }); // 🔒 pin reads/sims to BSC

  const REQUIRED_CHAIN = bsc.id; // 56 (BSC Mainnet)
  const isConnected = Boolean(address);
  const onCorrectChain = chainId === REQUIRED_CHAIN;

  // Subgraph-based referral earnings (lifetime + available)
  const { totals, loading: sgLoading, refetch, refetchAfterMutation, coolingDown } =
    useEarningsSG(address);

  // App wallet context (existing)
  const {
    totalReferralEarnings = 0, // not used for the referral card; we use subgraph lifetime
    currentStarLevelEarnings = 0,
    pendingGoldenStarRewards = 0,
    refreshTokenBalances,
    refreshWallet,
  } = (useWallet() as {
    totalReferralEarnings?: number;
    currentStarLevelEarnings?: number;
    pendingGoldenStarRewards?: number;
    refreshTokenBalances?: () => void;
    refreshWallet?: () => void;
  }) || {};

  /* ===== Writes: simulate → write (force proxy & chain) ===== */
  const {
    writeContractAsync,
    data: txHash,
    isPending: writePending,
    error: writeErr, // we won't render this directly anymore
  } = useWriteContract();
  const { isLoading: confirmingTx, isSuccess: okTx } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimReferral = async () => {
    if (!publicClient) throw new Error("No public client");
    await publicClient.simulateContract({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimReferralRewards",
      account: address as Address,
      chainId: REQUIRED_CHAIN,
      args: [],
    });
    return writeContractAsync({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimReferralRewards",
      chainId: REQUIRED_CHAIN,
      args: [],
    });
  };

  const claimStar = async () => {
    if (!publicClient) throw new Error("No public client");
    await publicClient.simulateContract({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimStarLevelRewards",
      account: address as Address,
      chainId: REQUIRED_CHAIN,
      args: [],
    });
    return writeContractAsync({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimStarLevelRewards",
      chainId: REQUIRED_CHAIN,
      args: [],
    });
  };

  const claimGolden = async () => {
    if (!publicClient) throw new Error("No public client");
    await publicClient.simulateContract({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimGoldenStarRewards",
      account: address as Address,
      chainId: REQUIRED_CHAIN,
      args: [],
    });
    return writeContractAsync({
      address: PROXY,
      abi: STAKING_ABI,
      functionName: "claimGoldenStarRewards",
      chainId: REQUIRED_CHAIN,
      args: [],
    });
  };

  // After a successful write, auto-refresh subgraph & wallet bits
  useEffect(() => {
    if (!okTx) return;

    // Broadcast for any listeners
    window.dispatchEvent(new CustomEvent("rewards:claimed", { detail: { tx: txHash } }));

    // Backoff poll subgraph until it indexes the new claim
    void refetchAfterMutation();

    // Keep your other refreshes
    refreshTokenBalances?.();
    refreshWallet?.();

    showUserSuccess("Claim submitted", "We’ll refresh your earnings shortly.");

    // Reset local claim state
    setClaimingType(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okTx]);

  useEffect(() => {
    if (writeErr) setClaimingType(null); // safety; don't render writeErr anywhere
  }, [writeErr]);

  /* ===== canWrite flags ===== */
  const referralAvailable = Number(formatUnits(totals.availSum, 18));
  const referralBreakdown = {
    y: Number(formatUnits(totals.availY, 18)),
    s: Number(formatUnits(totals.availS, 18)),
    p: Number(formatUnits(totals.availP, 18)),
  };
  const referralLifetime = Number(formatUnits(totals.lifeSum, 18));

  const canWriteReferral =
    isConnected && onCorrectChain && totals.availSum > 0n && !writePending && !confirmingTx;

  const canWriteStar =
    isConnected && onCorrectChain && (currentStarLevelEarnings || 0) > 0 && !writePending && !confirmingTx;

  const canWriteGolden =
    isConnected && onCorrectChain && (pendingGoldenStarRewards || 0) > 0 && !writePending && !confirmingTx;

  /* ===== Cards ===== */
  const earnings: EarningCard[] = useMemo(
    () => [
      {
        type: "referral",
        title: "Referral Earnings",
        // Show AVAILABLE in the card headline
        available: referralAvailable,
        // Lifetime used to compute the global “Total Earnings” header
        lifetime: referralLifetime,
        breakdown: referralBreakdown,
        nextClaim: new Date(), // immediate when > 0
        icon: TrendingUp,
        accent: {
          iconBg: "bg-blue-600/20",
          iconFg: "text-blue-300",
          chip: "border-blue-700 text-blue-300",
          chipMuted: "border-gray-600 text-gray-400",
          ring: "focus-visible:ring-blue-500/40",
        },
        description: "Earnings from your referral network.",
        onClaim: () => (canWriteReferral ? claimReferral() : Promise.reject(new Error("Not ready"))),
        canWrite: canWriteReferral,
        pending: writePending || confirmingTx,
        ok: okTx,
      },
      {
        type: "star",
        title: "Star Level Earnings",
        available: currentStarLevelEarnings,
        nextClaim: new Date(), // depends on your contract rules
        icon: Star,
        accent: {
          iconBg: "bg-purple-600/20",
          iconFg: "text-purple-300",
          chip: "border-purple-700 text-purple-300",
          chipMuted: "border-gray-600 text-gray-400",
          ring: "focus-visible:ring-purple-500/40",
        },
        description: "Rewards from your current star level.",
        onClaim: () => (canWriteStar ? claimStar() : Promise.reject(new Error("Not ready"))),
        canWrite: canWriteStar,
        pending: writePending || confirmingTx,
        ok: okTx,
      },
      {
        type: "golden",
        title: "Golden Star Earnings",
        available: pendingGoldenStarRewards,
        nextClaim: null,
        icon: Award,
        accent: {
          iconBg: "bg-amber-600/20",
          iconFg: "text-amber-300",
          chip: "border-amber-700 text-amber-300",
          chipMuted: "border-gray-600 text-gray-400",
          ring: "focus-visible:ring-amber-500/40",
        },
        description: "Special rewards for Golden Star achievement.",
        onClaim: () => (canWriteGolden ? claimGolden() : Promise.reject(new Error("Not ready"))),
        canWrite: canWriteGolden,
        pending: writePending || confirmingTx,
        ok: okTx,
      },
    ],
    [
      referralAvailable,
      referralLifetime,
      referralBreakdown.y,
      referralBreakdown.s,
      referralBreakdown.p,
      currentStarLevelEarnings,
      pendingGoldenStarRewards,
      canWriteReferral,
      canWriteStar,
      canWriteGolden,
      writePending,
      confirmingTx,
      okTx,
    ]
  );

  /* ===== Claim click handler (centralized errors) ===== */
  const handleClaim = async (card: EarningCard) => {
    setFriendlyError(null);
    if (!card?.canWrite || typeof card?.onClaim !== "function") return;

    try {
      setClaimingType(card.type);
      await card.onClaim();
    } catch (e) {
      // Map to our unified app error & show toast
      const txOp = card.type === "referral" ? "claimReferral" : "claim";
      const appErr = explainTxError(txOp as any, e);
      showUserError(appErr);

      // Also show a compact inline panel below the grid (mobile-friendly)
      const { title, body } = formatForUser(txOp as any, appErr);
      setFriendlyError(appErr.hint ? `${title}: ${body}\n${appErr.hint}` : `${title}: ${body}`);

      setClaimingType(null);
    }
  };

  const formatTimeUntilClaim = (date: Date | null) => {
    if (!date) return "Not available";
    const diff = date.getTime() - Date.now();
    if (diff <= 0) return "Available now";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  // Global header “Total Earnings” = referral lifetime + current (star + golden)
  const totalEarningsHeader =
    referralLifetime + (currentStarLevelEarnings || 0) + (pendingGoldenStarRewards || 0);

  return (
    <div className="space-y-6">
      {/* Header / Total Earnings + Refresh */}
      <DarkCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Earnings</h3>
            <p className="text-sm text-gray-400">
              Claim rewards from your referral network and star levels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={sgLoading || coolingDown}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs border transition",
                sgLoading || coolingDown
                  ? "opacity-60 cursor-not-allowed border-white/10 text-gray-400"
                  : "border-white/15 hover:bg-white/5 text-white",
              ].join(" ")}
              title="Refresh"
            >
              <RefreshCcw className={"h-4 w-4 " + (sgLoading ? "animate-spin" : "")} />
              {sgLoading ? "Refreshing…" : coolingDown ? "Cooling down…" : "Refresh"}
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">
                {totalEarningsHeader.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Earnings</div>
            </div>
          </div>
        </div>
      </DarkCard>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {earnings.map((e) => {
          const hasClaimables = (e.available || 0) > 0;
          const isClaimable = hasClaimables && (!e.nextClaim || e.nextClaim <= new Date());
          const isClaiming = claimingType === e.type;
          const isReferral = e.type === "referral";

          return (
            <DarkCard key={e.type} className="hover:bg-gray-780 transition-colors">
              {/* Icon + title + available */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl ${e.accent.iconBg} flex items-center justify-center`}>
                    <e.icon className={`w-6 h-6 ${e.accent.iconFg}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{e.title}</div>
                    <div className="text-[13px] text-gray-400 truncate">{e.description}</div>
                  </div>
                </div>

                {/* IMPORTANT: show "Total Available" for referral card */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-gray-100">
                    {e.available.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {isReferral ? "Total Available" : "Available"}
                  </div>
                </div>
              </div>

              {/* Availability + referral breakdown */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[13px] text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatTimeUntilClaim(e.nextClaim)}</span>
                </div>

                {isReferral && (
                  <div className="flex items-center gap-2">
                    <Pill className={hasClaimables ? e.accent.chip : e.accent.chipMuted}>
                      YY {(e.breakdown?.y ?? 0).toLocaleString()}
                    </Pill>
                    <Pill className={hasClaimables ? e.accent.chip : e.accent.chipMuted}>
                      SY {(e.breakdown?.s ?? 0).toLocaleString()}
                    </Pill>
                    <Pill className={hasClaimables ? e.accent.chip : e.accent.chipMuted}>
                      PY {(e.breakdown?.p ?? 0).toLocaleString()}
                    </Pill>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleClaim(e)}
                disabled={!isClaimable || e.pending || isClaiming || !e.canWrite}
                className={[
                  "mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium outline-none",
                  "transition-colors focus-visible:ring-2",
                  isClaimable && e.canWrite
                    ? `bg-emerald-600 hover:bg-emerald-500 text-white ${e.accent.ring}`
                    : "bg-gray-700 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                {isClaiming || e.pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : isClaimable && e.canWrite ? (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {e.type === "referral"
                        ? `Claim ${e.available.toLocaleString()}`
                        : `Claim ${e.available.toLocaleString()}`}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>{(e.available || 0) === 0 ? "No earnings" : "Not ready"}</span>
                  </>
                )}
              </button>
            </DarkCard>
          );
        })}
      </div>

      {/* Decoded/friendly error (single compact panel) */}
      {friendlyError && (
        <DarkCard className="border border-rose-700/40 bg-rose-900/10">
          <div className="text-sm text-rose-300 whitespace-pre-line">{friendlyError}</div>
        </DarkCard>
      )}
    </div>
  );
};

export default EarningsClaimPanel;
