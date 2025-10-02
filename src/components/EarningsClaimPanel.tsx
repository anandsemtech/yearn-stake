// src/components/EarningsClaimPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Award, Clock, Star, TrendingUp, Zap } from "lucide-react";
import { Address, BaseError, ContractFunctionRevertedError, decodeErrorResult, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useWallet } from "@/contexts/hooks/useWallet";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

/* ===== Proxy (staking) address from env ===== */
const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

/* ===== ENV tokens (fallback only) ===== */
const Y_ENV = import.meta.env.VITE_YYEARN_ADDRESS as `0x${string}` | undefined;
const S_ENV = import.meta.env.VITE_SYEARN_ADDRESS as `0x${string}` | undefined;
const P_ENV = import.meta.env.VITE_PYEARN_ADDRESS as `0x${string}` | undefined;

/* ===== Minimal ABIs ===== */
const REFERRAL_EARNINGS_ABI = [
  {
    type: "function",
    name: "referralEarnings",
    stateMutability: "view",
    inputs: [
      { name: "referrer", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

const TOKEN_GETTERS_ABI = [
  { type: "function", name: "yYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "sYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pYearn", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

/* ---------- Dark UI atoms ---------- */
const DarkCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
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

const Pill: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={["inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border", className || ""].join(" ")}>
    {children}
  </span>
);

/* ----------------------------------- */
type EarningCard = {
  type: "referral" | "star" | "golden";
  title: string;
  amount: number;
  availableRaw?: bigint | null;
  available: number;
  breakdown?: { y: number; s: number; p: number };
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
  err?: Error;
};

const EarningsClaimPanel: React.FC = () => {
  const [claimingType, setClaimingType] = useState<string | null>(null);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const REQUIRED_CHAIN = baseSepolia.id; // 84532
  const isConnected = Boolean(address);
  const onCorrectChain = chainId === REQUIRED_CHAIN;

  const {
    totalReferralEarnings = 0,
    currentStarLevelEarnings = 0,
    pendingGoldenStarRewards = 0,
    refreshTokenBalances,
    refreshWallet,
  } = useWallet() as {
    totalReferralEarnings?: number;
    currentStarLevelEarnings?: number;
    pendingGoldenStarRewards?: number;
    refreshTokenBalances?: () => void;
    refreshWallet?: () => void;
  };

  /* ====== STATE for token addresses (with fallback) ====== */
  const [onChainY, setOnChainY] = useState<Address | undefined>(undefined);
  const [onChainS, setOnChainS] = useState<Address | undefined>(undefined);
  const [onChainP, setOnChainP] = useState<Address | undefined>(undefined);
  const [usedFallbackEnv, setUsedFallbackEnv] = useState(false);

  /* ====== Batch read token addresses from the proxy ====== */
  const tokenAddrs = useReadContracts({
    allowFailure: true,
    contracts: [
      { abi: TOKEN_GETTERS_ABI, address: PROXY, functionName: "yYearn" },
      { abi: TOKEN_GETTERS_ABI, address: PROXY, functionName: "sYearn" },
      { abi: TOKEN_GETTERS_ABI, address: PROXY, functionName: "pYearn" },
    ],
    query: {
      enabled: Boolean(PROXY && isConnected && onCorrectChain),
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  });

  /* ====== Adopt token getter results (with single-read + ENV fallback) ====== */
  useEffect(() => {
    (async () => {
      if (!publicClient || !PROXY || !isConnected || !onCorrectChain) {
        setOnChainY(undefined);
        setOnChainS(undefined);
        setOnChainP(undefined);
        return;
      }

      const yRes = tokenAddrs.data?.[0]?.result as Address | undefined;
      const sRes = tokenAddrs.data?.[1]?.result as Address | undefined;
      const pRes = tokenAddrs.data?.[2]?.result as Address | undefined;

      if (yRes && sRes && pRes) {
        setOnChainY(yRes);
        setOnChainS(sRes);
        setOnChainP(pRes);
        setUsedFallbackEnv(false);
        return;
      }

      try {
        const [ySingle, sSingle, pSingle] = (await Promise.all([
          publicClient.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "yYearn" }),
          publicClient.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "sYearn" }),
          publicClient.readContract({ address: PROXY, abi: TOKEN_GETTERS_ABI, functionName: "pYearn" }),
        ])) as [Address, Address, Address];

        setOnChainY(ySingle);
        setOnChainS(sSingle);
        setOnChainP(pSingle);
        setUsedFallbackEnv(false);
      } catch {
        if (Y_ENV && S_ENV && P_ENV) {
          setOnChainY(Y_ENV as Address);
          setOnChainS(S_ENV as Address);
          setOnChainP(P_ENV as Address);
          setUsedFallbackEnv(true);
        } else {
          setOnChainY(undefined);
          setOnChainS(undefined);
          setOnChainP(undefined);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, PROXY, isConnected, onCorrectChain, tokenAddrs.data?.[0], tokenAddrs.data?.[1], tokenAddrs.data?.[2]]);

  const tokensLoaded = Boolean(onChainY && onChainS && onChainP);

  /* ===== Live referral claimables using the resolved token addresses ===== */
  const referralClaimables = useReadContracts({
    allowFailure: true,
    contracts:
      tokensLoaded && address
        ? ([
            { abi: REFERRAL_EARNINGS_ABI, address: PROXY, functionName: "referralEarnings", args: [address as Address, onChainY as Address] },
            { abi: REFERRAL_EARNINGS_ABI, address: PROXY, functionName: "referralEarnings", args: [address as Address, onChainS as Address] },
            { abi: REFERRAL_EARNINGS_ABI, address: PROXY, functionName: "referralEarnings", args: [address as Address, onChainP as Address] },
          ] as const)
        : [],
    query: {
      enabled: Boolean(tokensLoaded && address && onCorrectChain),
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  });

  const [claimY = 0n, claimS = 0n, claimP = 0n] =
    (referralClaimables.data?.map((r) => (r?.result as bigint) ?? 0n) as [bigint, bigint, bigint]) ?? [0n, 0n, 0n];

  const referralAvailableRaw = claimY + claimS + claimP;
  const referralAvailable = Number(formatUnits(referralAvailableRaw, 18));
  const referralBreakdown = {
    y: Number(formatUnits(claimY, 18)),
    s: Number(formatUnits(claimS, 18)),
    p: Number(formatUnits(claimP, 18)),
  };

  /* ===== Writes: simulate → write (force proxy & chain) ===== */
  const { writeContractAsync, data: txHash, isPending: writePending, error: writeErr } = useWriteContract();
  const { isLoading: confirmingTx, isSuccess: okTx } = useWaitForTransactionReceipt({ hash: txHash });

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

  useEffect(() => {
    if (writeErr || okTx) setClaimingType(null);
  }, [writeErr, okTx]);

  useEffect(() => {
    if (okTx) {
      referralClaimables.refetch?.();
      tokenAddrs.refetch?.();
      refreshTokenBalances?.();
      refreshWallet?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okTx]);

  /* ===== canWrite flags ===== */
  const canWriteReferral = isConnected && onCorrectChain && tokensLoaded && referralAvailableRaw > 0n && !writePending && !confirmingTx;
  const canWriteStar = isConnected && onCorrectChain && (currentStarLevelEarnings || 0) > 0 && !writePending && !confirmingTx;
  const canWriteGolden = isConnected && onCorrectChain && (pendingGoldenStarRewards || 0) > 0 && !writePending && !confirmingTx;

  /* ===== Cards ===== */
  const earnings: EarningCard[] = useMemo(
    () => [
      {
        type: "referral",
        title: "Referral Earnings",
        amount: totalReferralEarnings,
        availableRaw: referralAvailableRaw,
        available: referralAvailable,
        breakdown: referralBreakdown,
        nextClaim: new Date(),
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
        err: writeErr as Error | undefined,
      },
      {
        type: "star",
        title: "Star Level Earnings",
        amount: currentStarLevelEarnings,
        availableRaw: null,
        available: currentStarLevelEarnings,
        nextClaim: new Date(),
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
        err: writeErr as Error | undefined,
      },
      {
        type: "golden",
        title: "Golden Star Earnings",
        amount: pendingGoldenStarRewards,
        availableRaw: null,
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
        err: writeErr as Error | undefined,
      },
    ],
    [
      totalReferralEarnings,
      currentStarLevelEarnings,
      pendingGoldenStarRewards,
      referralAvailableRaw,
      referralAvailable,
      referralBreakdown.y,
      referralBreakdown.s,
      referralBreakdown.p,
      canWriteReferral,
      canWriteStar,
      canWriteGolden,
      writePending,
      confirmingTx,
      okTx,
      writeErr,
    ]
  );

  /* ===== Friendly revert decoding ===== */
  const decodeFriendly = (e: unknown) => {
    if (e instanceof BaseError) {
      const revert = e.walk((err) => err instanceof ContractFunctionRevertedError) as
        | ContractFunctionRevertedError
        | undefined;
      const data = (revert as any)?.data || (revert as any)?.cause?.data;
      if (data) {
        try {
          const decoded = decodeErrorResult({ abi: STAKING_ABI, data: data as `0x${string}` });
          const name = decoded.errorName;
          const args = decoded.args ?? [];
          return args.length ? `${name}: ${args.map(String).join(", ")}` : name;
        } catch { /* ignore */ }
      }
      return e.shortMessage || e.message;
    }
    return (e as Error)?.message ?? String(e);
  };

  const handleClaim = async (type: string) => {
    setFriendlyError(null);
    const idx = type === "referral" ? 0 : type === "star" ? 1 : 2;
    const target = earnings[idx];
    if (!target?.canWrite || typeof target?.onClaim !== "function") return;

    try {
      setClaimingType(type);
      await target.onClaim();
    } catch (e) {
      const msg = decodeFriendly(e);
      setFriendlyError(msg);
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

  const totalAvailable = referralAvailable + currentStarLevelEarnings + pendingGoldenStarRewards;

  return (
    <div className="space-y-6">
      {/* Header / Total */}
      <DarkCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Earnings</h3>
            <p className="text-sm text-gray-400">Claim rewards from your referral network and star levels.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">
              ${totalAvailable.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Available</div>
          </div>
        </div>
        {usedFallbackEnv && (
          <div className="mt-2 text-[12px] text-amber-300">
            Using ENV token addresses as a fallback while token pointers load…
          </div>
        )}
      </DarkCard>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {earnings.map((e) => {
          const isReferral = e.type === "referral";
          const hasClaimables = isReferral
            ? ((e.availableRaw as bigint) ?? 0n) > 0n
            : (e.available || 0) > 0;

          const isClaimable = hasClaimables && (!e.nextClaim || e.nextClaim <= new Date());
          const isClaiming = claimingType === e.type;

          return (
            <DarkCard key={e.type} className="hover:bg-gray-780 transition-colors">
              {/* Icon + amount */}
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

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-gray-100">
                    ${e.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500">Total earned</div>
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
                onClick={() => handleClaim(e.type)}
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
                        : `Claim $${(e.available || 0).toLocaleString()}`}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>{(e.available || 0) === 0 ? "No earnings" : "Not ready"}</span>
                  </>
                )}
              </button>

              {/* Error from wagmi write */}
              {e.err && <div className="mt-2 text-[12px] text-red-400">{e.err.message}</div>}
            </DarkCard>
          );
        })}
      </div>

      {/* Decoded revert / friendly error */}
      {friendlyError && (
        <DarkCard className="border border-rose-700/40 bg-rose-900/10">
          <div className="text-sm text-rose-300">{friendlyError}</div>
        </DarkCard>
      )}

      {/* Claim All */}
      {totalAvailable > 0 && (
        <DarkCard className="border-emerald-700">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-white font-semibold">Claim All Available Earnings</div>
              <div className="text-sm text-gray-400">Runs up to 3 transactions (referral, star, golden).</div>
            </div>
            <button
              onClick={async () => {
                setClaimingType("all");
                try {
                  if (canWriteReferral) await claimReferral();
                  if (canWriteStar) await claimStar();
                  if (canWriteGolden) await claimGolden();
                } catch (e) {
                  const msg = decodeFriendly(e);
                  setFriendlyError(msg);
                } finally {
                  setClaimingType(null);
                }
              }}
              disabled={claimingType === "all"}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-60"
            >
              {claimingType === "all" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Claim ${totalAvailable.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </DarkCard>
      )}
    </div>
  );
};

export default EarningsClaimPanel;
