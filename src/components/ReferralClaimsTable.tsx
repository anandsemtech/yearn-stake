import React, { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits, decodeEventLog } from "viem";
import { usePublicClient, useAccount } from "wagmi";
import { RefreshCcw, Filter, User, Users, Search } from "lucide-react";

/* ===== Event ABI item (indexing matches contract!) ===== */
const ReferralRewardsClaimedEvent = {
  type: "event",
  name: "ReferralRewardsClaimed",
  inputs: [
    { indexed: true,  name: "user",    type: "address" },
    { indexed: false, name: "yAmount", type: "uint256" },
    { indexed: false, name: "sAmount", type: "uint256" },
    { indexed: false, name: "pAmount", type: "uint256" },
  ],
} as const;

/* ===== Small loader bits ===== */
const Progress: React.FC = () => (
  <div className="w-full h-1.5 bg-white/5 rounded overflow-hidden">
    <div className="h-full w-1/3 bg-emerald-500/70 animate-progress" />
    <style>{`
      .animate-progress { animation: progressSlide 1.2s ease-in-out infinite; }
      @keyframes progressSlide {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(40%); }
        100% { transform: translateX(160%); }
      }
    `}</style>
  </div>
);

const SkeletonRow: React.FC = () => (
  <div className="px-3 py-2 grid grid-cols-1 md:grid-cols-12 gap-1">
    <div className="md:col-span-3 h-3 rounded bg-white/10" />
    <div className="md:col-span-2 h-3 rounded bg-white/10" />
    <div className="md:col-span-2 h-3 rounded bg-white/10" />
    <div className="md:col-span-2 h-3 rounded bg-white/10" />
    <div className="md:col-span-3 h-3 rounded bg-white/10" />
  </div>
);

/* ===== Types ===== */
type ClaimLog = {
  txHash: `0x${string}`;
  blockNumber: bigint;
  user: Address;
  y: bigint;
  s: bigint;
  p: bigint;
  ts?: number;
};

type Scope = "mine" | "all";

type Props = {
  proxy: Address;
  deployBlock?: bigint;
  /** optional: initial scope (defaults to "mine") */
  initialScope?: Scope;
  className?: string;
  title?: string;
};

/* ===== Data hook with optional user filter (uses indexed topic) ===== */
function useReferralClaimEvents(
  proxy?: Address,
  deployBlock?: bigint,
  filterUser?: Address | null
) {
  const pc = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ClaimLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!pc || !proxy) return;
    setLoading(true);
    setError(null);
    try {
      let fromBlock = 0n;
      try {
        if (deployBlock && deployBlock > 0n) {
          fromBlock = deployBlock;
        } else {
          const tip = await pc.getBlockNumber();
          fromBlock = tip > 120000n ? tip - 120000n : 0n;
        }
      } catch {}

      const params: any = {
        address: proxy,
        event: ReferralRewardsClaimedEvent,
        fromBlock,
        toBlock: "latest",
      };

      // Efficient topic filtering when user is set
      if (filterUser) {
        params.args = { user: filterUser };
      }

      const raw = await pc.getLogs(params);

      const items: ClaimLog[] = raw.map((l) => {
        // viem generally fills args, keep a safe decode path
        // @ts-ignore
        const a = (l as any).args;
        let user: Address | undefined;
        let y: bigint | undefined, s: bigint | undefined, p: bigint | undefined;

        if (a && "user" in a) {
          user = a.user as Address;
          y = (a.yAmount as bigint) ?? 0n;
          s = (a.sAmount as bigint) ?? 0n;
          p = (a.pAmount as bigint) ?? 0n;
        } else {
          try {
            const dec = decodeEventLog({
              abi: [ReferralRewardsClaimedEvent],
              data: l.data,
              topics: l.topics,
            }).args as any;
            user = dec.user as Address;
            y = (dec.yAmount as bigint) ?? 0n;
            s = (dec.sAmount as bigint) ?? 0n;
            p = (dec.pAmount as bigint) ?? 0n;
          } catch {}
        }

        return {
          txHash: l.transactionHash!,
          blockNumber: l.blockNumber!,
          user: (user ??
            "0x0000000000000000000000000000000000000000") as Address,
          y: y || 0n,
          s: s || 0n,
          p: p || 0n,
        };
      });

      // Batch timestamps
      const uniqBlocks = Array.from(new Set(items.map((i) => i.blockNumber)));
      const blockTs = new Map<bigint, number>();
      await Promise.all(
        uniqBlocks.map(async (bn) => {
          try {
            const b = await pc.getBlock({ blockNumber: bn });
            if (b?.timestamp) blockTs.set(bn, Number(b.timestamp));
          } catch {}
        })
      );

      const withTs = items.map((i) => ({ ...i, ts: blockTs.get(i.blockNumber) }));
      withTs.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      setLogs(withTs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read claim logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // live updates
  useEffect(() => {
    fetchAll();
    if (!pc || !proxy) return;

    // when filtering by user, also filter watchEvent
    const watchParams: any = {
      address: proxy,
      event: ReferralRewardsClaimedEvent,
      onLogs: (newLogs: any[]) => {
        const next: ClaimLog[] = newLogs.map((l) => {
          // @ts-ignore
          const a = (l as any).args;
          return {
            txHash: l.transactionHash!,
            blockNumber: l.blockNumber!,
            user: a.user as Address,
            y: (a.yAmount as bigint) ?? 0n,
            s: (a.sAmount as bigint) ?? 0n,
            p: (a.pAmount as bigint) ?? 0n,
          };
        });

        // if a filter is active, drop non-matching in the live stream
        const filtered = filterUser
          ? next.filter((n) => n.user.toLowerCase() === filterUser.toLowerCase())
          : next;

        if (!filtered.length) return;

        setLogs((prev) => {
          const merged = [...filtered.map((x) => ({ ...x, ts: undefined })), ...prev];
          const seen = new Set<string>();
          return merged.filter((i) => {
            const k = `${i.txHash}-${i.blockNumber}-${i.user}-${i.y}-${i.s}-${i.p}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        });
      },
      poll: true,
    };

    if (filterUser) {
      // viem supports args on watchEvent as well
      watchParams.args = { user: filterUser };
    }

    const unwatch = pc.watchEvent(watchParams);
    return () => {
      try { unwatch?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy, (filterUser || "").toLowerCase()]);

  const totals = useMemo(
    () =>
      logs.reduce(
        (acc, l) => {
          acc.y += l.y;
          acc.s += l.s;
          acc.p += l.p;
          return acc;
        },
        { y: 0n, s: 0n, p: 0n }
      ),
    [logs]
  );

  return { loading, logs, totals, error, refetch: fetchAll };
}

/* ===== Main Component ===== */
const ReferralClaimsTable: React.FC<Props> = ({
  proxy,
  deployBlock,
  initialScope = "mine",
  className,
  title = "ReferralRewardsClaimed",
}) => {
  const { address } = useAccount();
  const [scope, setScope] = useState<Scope>(initialScope);

  // Determine active filter address
  const filterUser = scope === "mine" ? (address ?? null) : null;

  const { loading, logs, totals, error, refetch } = useReferralClaimEvents(
    proxy,
    deployBlock,
    filterUser as Address | null
  );

  const totYY = Number(formatUnits(totals.y, 18));
  const totSY = Number(formatUnits(totals.s, 18));
  const totPY = Number(formatUnits(totals.p, 18));

  return (
    <div className={["rounded-2xl border border-white/10 overflow-hidden bg-[#0F1424]", className || ""].join(" ")}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121A2D]/95 backdrop-blur">
        <div className="flex items-center gap-2 text-white">
          <Search className="w-5 h-5" />
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-xs text-gray-400">({scope === "mine" ? "My Claims" : "All Users"})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setScope("mine")}
              className={
                "px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " +
                (scope === "mine" ? "bg-white/15 text-white" : "bg-white/5 text-gray-300 hover:text-white")
              }
              title="Show only my claims"
            >
              <User className="w-4 h-4" /> Mine
            </button>
            <button
              onClick={() => setScope("all")}
              className={
                "px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " +
                (scope === "all" ? "bg-white/15 text-white" : "bg-white/5 text-gray-300 hover:text-white")
              }
              title="Show all users"
            >
              <Users className="w-4 h-4" /> All
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10 text-gray-100 hover:bg-white/15"
            title="Refetch"
          >
            <RefreshCcw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="px-4 py-3 bg-white/[0.03]">
        <div className="text-xs text-gray-400 mb-1">
          Totals {deployBlock ? ` (since block ${deployBlock.toString()})` : ""}
          {scope === "mine" && address ? ` • Filter: ${address}` : ""}
        </div>
        <div className="font-mono text-sm text-gray-100">
          YY {totYY.toLocaleString()} <span className="text-gray-400">•</span>{" "}
          SY {totSY.toLocaleString()} <span className="text-gray-400">•</span>{" "}
          PY {totPY.toLocaleString()}
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5">
        <div className="col-span-3">User</div>
        <div className="col-span-2 text-right">YY</div>
        <div className="col-span-2 text-right">SY</div>
        <div className="col-span-2 text-right">PY</div>
        <div className="col-span-3 text-right">Block / Time</div>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-auto divide-y divide-white/5">
        {loading && (
          <>
            <div className="p-4"><Progress /></div>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </>
        )}

        {!loading && error && (
          <div className="p-4 text-rose-300 text-sm">{error}</div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-sm text-gray-200 font-medium">
                {scope === "mine" ? "No claims for your address yet." : "No claim events found."}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {scope === "mine"
                  ? "Once you claim referral rewards, they will appear here instantly."
                  : "Try adjusting the block window or check back later."}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && logs.map((l, idx) => {
          const y = Number(formatUnits(l.y, 18));
          const s = Number(formatUnits(l.s, 18));
          const p = Number(formatUnits(l.p, 18));
          const when = l.ts ? new Date(l.ts * 1000) : undefined;
          return (
            <div
              key={`${l.txHash}-${idx}`}
              className="px-3 py-2 grid grid-cols-1 md:grid-cols-12 gap-1 text-xs text-gray-200"
            >
              <div className="md:col-span-3 font-mono break-all">{l.user}</div>
              <div className="md:col-span-2 text-right">YY {y.toLocaleString()}</div>
              <div className="md:col-span-2 text-right">SY {s.toLocaleString()}</div>
              <div className="md:col-span-2 text-right">PY {p.toLocaleString()}</div>
              <div className="md:col-span-3 text-right text-gray-400">
                #{l.blockNumber.toString()} {when ? "• " + when.toLocaleString() : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralClaimsTable;
