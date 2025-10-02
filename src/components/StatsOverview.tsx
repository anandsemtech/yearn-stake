// src/components/StatsOverview.tsx
import React from "react";
import { DollarSign, TrendingUp, Users, Package as LPackage } from "lucide-react";
import { useWallet } from "../contexts/hooks/useWallet";
import { useUserAllRewards } from "../graphql/hooks/useUserAllRewards";
import IconYearnCoin from "./icons/IconYearnCoin";



const pillTone = (delta?: string) => {
  if (!delta) return "bg-white/10 text-white/70 ring-1 ring-white/10";
  const neg = delta.trim().startsWith("-");
  return neg
    ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20"
    : "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20";
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

const StatsOverview: React.FC = () => {
  const { user } = useWallet();
  const { totalRewardsEarnedByUser } = useUserAllRewards();

  const stats = [
    {
      title: "Total Earnings",
      value: `$${(totalRewardsEarnedByUser || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      change: "+12.5%",
    },
    {
      title: "Active Packages",
      value: String(user?.activePackages.length ?? 0),
      icon: LPackage,
      color: "blue",
      change: undefined,
    },
    {
      title: "Monthly ROI",
      value: "8.5%",
      icon: TrendingUp,
      color: "purple",
      change: "+0.5%",
    },
    {
      title: "Network Size",
      value: "1,247",
      icon: Users,
      color: "orange",
      change: "+89",
    },
  ] as const;

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
              className={`shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${colorGrad[s.color as keyof typeof colorGrad]} text-white ring-1 ring-black/10`}
            >
              <s.icon className="w-5 h-5" />
            </div>

            <div
              className={`rounded-full px-2.5 py-1 text-xs ${pillTone(s.change)}`}
              title={s.change ? `${s.change} since last period` : "No change data"}
            >
              {s.change ? (
                <span className="tabular-nums">{arrow(s.change)} {s.change}</span>
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
