import React, { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { decodeEventLog, formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { RefreshCcw, Search, User, Users } from "lucide-react";

/* ===== ABI item ===== */
const GoldenStarRewardClaimedEvent = {
  type: "event",
  name: "GoldenStarRewardClaimed",
  inputs: [
    { indexed: true,  name: "user",   type: "address" },
    { indexed: false, name: "amount", type: "uint256" },
  ],
} as const;

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
    <div className="md:col-span-5 h-3 rounded bg-white/10" />
    <div className="md:col-span-4 h-3 rounded bg-white/10" />
    <div className="md:col-span-3 h-3 rounded bg-white/10" />
  </div>
);

type Scope = "mine" | "all";

type GSLog = {
  txHash: `0x${string}`;
  blockNumber: bigint;
  user: Address;
  amount: bigint;
  ts?: number;
};

type Props = {
  proxy: Address;
  deployBlock?: bigint;
  initialScope?: Scope;
  className?: string;
  title?: string;
  yyDecimals?: number; // default 18
};

function useGoldenStarEvents(
  proxy?: Address,
  deployBlock?: bigint,
  filterUser?: Address | null
) {
  const pc = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<GSLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!pc || !proxy) return;
    setLoading(true); setError(null);
    try {
      let fromBlock = 0n;
      try {
        if (deployBlock && deployBlock > 0n) fromBlock = deployBlock;
        else {
          const tip = await pc.getBlockNumber();
          fromBlock = tip > 120000n ? tip - 120000n : 0n;
        }
      } catch {}
      const params: any = {
        address: proxy,
        event: GoldenStarRewardClaimedEvent,
        fromBlock,
        toBlock: "latest",
      };
      if (filterUser) params.args = { user: filterUser };

      const raw = await pc.getLogs(params);
      const items: GSLog[] = raw.map((l) => {
        // @ts-ignore
        const a = (l as any).args;
        let user: Address | undefined;
        let amount: bigint | undefined;
        if (a && "user" in a) {
          user = a.user as Address;
          amount = (a.amount as bigint) ?? 0n;
        } else {
          try {
            const dec = decodeEventLog({
              abi: [GoldenStarRewardClaimedEvent],
              data: l.data,
              topics: l.topics,
            }).args as any;
            user = dec.user as Address;
            amount = (dec.amount as bigint) ?? 0n;
          } catch {}
        }
        return {
          txHash: l.transactionHash!,
          blockNumber: l.blockNumber!,
          user: (user ?? "0x0000000000000000000000000000000000000000") as Address,
          amount: amount || 0n,
        };
      });

      // timestamps
      const uniqBlocks = Array.from(new Set(items.map(i => i.blockNumber)));
      const blockTs = new Map<bigint, number>();
      await Promise.all(uniqBlocks.map(async (bn) => {
        try {
          const b = await pc.getBlock({ blockNumber: bn });
          if (b?.timestamp) blockTs.set(bn, Number(b.timestamp));
        } catch {}
      }));
      const withTs = items.map(i => ({ ...i, ts: blockTs.get(i.blockNumber) }));
      withTs.sort((a,b) => Number(b.blockNumber - a.blockNumber));
      setLogs(withTs);
    } catch (e:any) {
      setError(e?.message ?? "Failed to read golden star reward logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    if (!pc || !proxy) return;
    const watchParams: any = {
      address: proxy,
      event: GoldenStarRewardClaimedEvent,
      onLogs: (newLogs: any[]) => {
        const next: GSLog[] = newLogs.map((l) => {
          // @ts-ignore
          const a = (l as any).args;
          return {
            txHash: l.transactionHash!,
            blockNumber: l.blockNumber!,
            user: a.user as Address,
            amount: (a.amount as bigint) ?? 0n,
          };
        });
        const filtered = filterUser
          ? next.filter(n => n.user.toLowerCase() === filterUser.toLowerCase())
          : next;
        if (!filtered.length) return;
        setLogs(prev => {
          const merged = [...filtered.map(x => ({ ...x, ts: undefined })), ...prev];
          const seen = new Set<string>();
          return merged.filter(i => {
            const k = `${i.txHash}-${i.blockNumber}-${i.user}-${i.amount}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        });
      },
      poll: true,
    };
    if (filterUser) watchParams.args = { user: filterUser };
    const unwatch = pc.watchEvent(watchParams);
    return () => { try { unwatch?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy, (filterUser||"").toLowerCase()]);

  const total = useMemo(() => logs.reduce((acc, l) => acc + l.amount, 0n), [logs]);

  return { loading, logs, total, error, refetch: fetchAll };
}

/* ===== UI ===== */
const GoldenStarClaimsTable: React.FC<Props> = ({
  proxy,
  deployBlock,
  initialScope = "mine",
  className,
  title = "GoldenStarRewardClaimed",
  yyDecimals = 18,
}) => {
  const { address } = useAccount();
  const [scope, setScope] = useState<Scope>(initialScope);
  const filterUser = scope === "mine" ? (address ?? null) : null;

  const { loading, logs, total, error, refetch } = useGoldenStarEvents(
    proxy, deployBlock, filterUser as Address | null
  );

  const totYY = Number(formatUnits(total, yyDecimals));

  return (
    <div className={["rounded-2xl border border-white/10 overflow-hidden bg-[#0F1424]", className||""].join(" ")}>
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
              className={"px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " + (scope==="mine"?"bg-white/15 text-white":"bg-white/5 text-gray-300 hover:text-white")}
              title="Show only my claims"
            ><User className="w-4 h-4"/> Mine</button>
            <button
              onClick={() => setScope("all")}
              className={"px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " + (scope==="all"?"bg-white/15 text-white":"bg-white/5 text-gray-300 hover:text-white")}
              title="Show all users"
            ><Users className="w-4 h-4"/> All</button>
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
      <div className="px-4 py-3 bg-white/[0.03] text-gray-100">
        <div className="text-xs text-gray-400 mb-1">
          Totals {deployBlock ? ` (since block ${deployBlock.toString()})` : ""}{scope==="mine"&&address?` • Filter: ${address}`:""}
        </div>
        <div className="font-mono text-sm">YY {totYY.toLocaleString()}</div>
      </div>

      {/* Header */}
      <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5">
        <div className="md:col-span-5">User</div>
        <div className="md:col-span-4 text-right">YY</div>
        <div className="md:col-span-3 text-right">Block / Time</div>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-auto divide-y divide-white/5">
        {loading && (
          <>
            <div className="p-4"><Progress /></div>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </>
        )}

        {!loading && error && <div className="p-4 text-rose-300 text-sm">{error}</div>}

        {!loading && !error && logs.length === 0 && (
          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-200">
              {scope==="mine" ? "No golden star claims for your address yet." : "No GoldenStarRewardClaimed events found."}
            </div>
          </div>
        )}

        {!loading && !error && logs.map((l, idx) => {
          const yy = Number(formatUnits(l.amount, yyDecimals));
          const when = l.ts ? new Date(l.ts * 1000) : undefined;
          return (
            <div
              key={`${l.txHash}-${idx}`}
              className="px-3 py-2 grid grid-cols-1 md:grid-cols-12 gap-1 text-xs text-gray-200"
            >
              <div className="md:col-span-5 font-mono break-all">{l.user}</div>
              <div className="md:col-span-4 text-right">YY {yy.toLocaleString()}</div>
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

export default GoldenStarClaimsTable;
