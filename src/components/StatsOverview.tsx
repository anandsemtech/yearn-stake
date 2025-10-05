// src/components/StatsOverview.tsx
import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, Users, Package as LPackage } from "lucide-react";
import { formatUnits } from "viem";
import { useWallet } from "../contexts/hooks/useWallet";
import IconYearnCoin from "./icons/IconYearnCoin";

// Graph client
import { gql } from "graphql-request";
import { subgraph } from "@/lib/subgraph";

/* ---------------------------------- UI ---------------------------------- */

const pillTone = (delta?: string) => {
  if (!delta) return "bg-white/10 text-white/70 ring-1 ring-white/10";
  const neg = delta.trim().startsWith("-");
  return neg
    ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20"
    : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
};

const arrow = (delta?: string) => {
  if (!delta) return "";
  return delta.trim().startsWith("-") ? "▼" : "▲";
};

const colorGrad = {
  green: "from-emerald-500 to-teal-600",
  blue: "from-blue-500 to-cyan-600",
  purple: "from-purple-500 to-violet-600",
  orange: "from-orange-500 to-amber-600",
} as const;

/* ------------------------------- Subgraph ------------------------------- */

const QUERY_USER_STATS = gql/* GraphQL */ `
  query UserStats($id: ID!, $userBytes: Bytes!) {
    user: user(id: $id) {
      id
      totalStaked
      level
      isGoldenStar
      starEarningsTotal
      goldenEarningsTotal
    }
    stakes: stakes(first: 1000, where: { user: $id }) {
      totalStaked
      withdrawnPrincipal
      claimedAPR
    }
    referrals: referrals(first: 1000, where: { referrer: $id }) {
      id
    }
    refClaims: referralRewardsClaims(first: 1000, where: { user: $userBytes }) {
      yAmount
      sAmount
      pAmount
    }
  }
`;

type GBig = string; // Graph returns BigInt as string

interface GStake {
  totalStaked: GBig;
  withdrawnPrincipal: GBig;
  claimedAPR: GBig;
}

interface GRefClaim {
  yAmount: GBig;
  sAmount: GBig;
  pAmount: GBig;
}

interface GResp {
  user: {
    id: string;
    totalStaked: GBig;
    level: number;
    isGoldenStar: boolean;
    starEarningsTotal: GBig;
    goldenEarningsTotal: GBig;
  } | null;
  stakes: GStake[];
  referrals: { id: string }[];
  refClaims: GRefClaim[];
}

/* --------------------------------- Comp --------------------------------- */

const StatsOverview: React.FC = () => {
  const { user } = useWallet();
  const address = user?.address?.toLowerCase();

  const [loading, setLoading] = useState(false);
  const [activePrincipalYY, setActivePrincipalYY] = useState<bigint>(0n);
  const [aprClaimedYY, setAprClaimedYY] = useState<bigint>(0n);
  const [referralClaimedYYSPY, setReferralClaimedYYSPY] = useState<bigint>(0n);
  const [networkSize, setNetworkSize] = useState<number>(0);

  useEffect(() => {
    if (!address) {
      setActivePrincipalYY(0n);
      setAprClaimedYY(0n);
      setReferralClaimedYYSPY(0n);
      setNetworkSize(0);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const variables = { id: address, userBytes: `0x${address.replace(/^0x/, "")}` };
        const data = await subgraph.request<GResp>(QUERY_USER_STATS, variables);

        if (!mounted) return;

        // Σ(current active principal) = sum(max(totalStaked - withdrawnPrincipal, 0))
        const active = data.stakes.reduce<bigint>((acc, s) => {
          const total = BigInt(s.totalStaked || "0");
          const withdrawn = BigInt(s.withdrawnPrincipal || "0");
          const rem = total > withdrawn ? total - withdrawn : 0n;
          return acc + rem;
        }, 0n);

        // Σ(stake.claimedAPR) — gross claimed APR across stakes
        const apr = data.stakes.reduce<bigint>((acc, s) => acc + BigInt(s.claimedAPR || "0"), 0n);

        // Σ(all referral reward claims y+s+p)
        const refSum = data.refClaims.reduce<bigint>((acc, r) => {
          return (
            acc +
            BigInt(r.yAmount || "0") +
            BigInt(r.sAmount || "0") +
            BigInt(r.pAmount || "0")
          );
        }, 0n);

        setActivePrincipalYY(active);
        setAprClaimedYY(apr);
        setReferralClaimedYYSPY(refSum);
        setNetworkSize(data.referrals.length || 0);
      } catch (e) {
        // Fail-soft: leave zeros, but log for devs
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[StatsOverview] subgraph error:", e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [address]);

  const stats = useMemo(() => {
    // Pretty strings with 18 decimals; fall back to "—" while loading
    const fmt = (v: bigint) => {
      try {
        return Number.parseFloat(formatUnits(v, 18)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        });
      } catch {
        return "0";
      }
    };

    return [
      {
        title: "Active Principal (yYearn)",
        value: loading ? "—" : `${fmt(activePrincipalYY)} YY`,
        icon: DollarSign,
        color: "green",
        change: undefined as string | undefined, // you can wire deltas if you track periods
      },
      {
        title: "APR Claimed (gross)",
        value: loading ? "—" : `${fmt(aprClaimedYY)} YY`,
        icon: TrendingUp,
        color: "purple",
        change: undefined,
      },
      {
        title: "Referral Rewards Claimed",
        value: loading ? "—" : `${fmt(referralClaimedYYSPY)} (YY+SY+PY)`,
        icon: LPackage,
        color: "blue",
        change: undefined,
      },
      {
        title: "Network Size (direct)",
        value: loading ? "—" : String(networkSize),
        icon: Users,
        color: "orange",
        change: undefined,
      },
    ] as const;
  }, [loading, activePrincipalYY, aprClaimedYY, referralClaimedYYSPY, networkSize]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s, i) => (
        <div
          key={i}
          className="
            relative overflow-hidden rounded-2xl p-5
            bg-white/5 dark:bg-white/5 ring-1 ring-white/10
            shadow-[0_8px_40px_-8px_rgba(0,0,0,.35)]
            transition-all
            hover:shadow-[0_12px_50px_-6px_rgba(0,0,0,.45)]
          "
        >
          {/* soft top gradient line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* watermark */}
          <div className="pointer-events-none absolute bottom-3 right-3 opacity-10">
            <IconYearnCoin className="w-14 h-14 sm:w-16 sm:h-16" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div
              className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${
                colorGrad[s.color as keyof typeof colorGrad]
              } text-white ring-1 ring-black/10`}
            >
              <s.icon className="w-5 h-5" />
            </div>

            <div
              className={`rounded-full px-2.5 py-1 text-xs ${pillTone(s.change)}`}
              title={s.change ? `${s.change} since last period` : "No change data"}
            >
              {s.change ? (
                <span className="tabular-nums">
                  {arrow(s.change)} {s.change}
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-bold text-white tabular-nums">{s.value}</div>
            <div className="text-sm text-white/70 mt-0.5">{s.title}</div>
          </div>

          {/* hover spotlight */}
          <div className="pointer-events-none absolute -inset-10 opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
