import React, { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { decodeEventLog, formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import {
  Copy, Check, User, Users, RefreshCcw, Search,
  Sparkles, Star, Crown
} from "lucide-react";

/* =========================================================
   Event ABIs (indexed config must match your contract)
   ========================================================= */
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

const StarRewardClaimedEvent = {
  type: "event",
  name: "StarRewardClaimed",
  inputs: [
    { indexed: true,  name: "user",  type: "address" },
    { indexed: false, name: "level", type: "uint8" },
    { indexed: false, name: "amount",type: "uint256" },
  ],
} as const;

const GoldenStarRewardClaimedEvent = {
  type: "event",
  name: "GoldenStarRewardClaimed",
  inputs: [
    { indexed: true,  name: "user",   type: "address" },
    { indexed: false, name: "amount", type: "uint256" },
  ],
} as const;

/* =========================================================
   Small UI atoms
   ========================================================= */
const Progress: React.FC = () => (
  <div className="w-full h-1.5 bg-white/5 rounded overflow-hidden">
    <div className="h-full w-1/3 bg-emerald-500/70 animate-[progressSlide_1.2s_ease-in-out_infinite]" />
    <style>{`@keyframes progressSlide{0%{transform:translateX(-100%)}50%{transform:translateX(40%)}100%{transform:translateX(160%)}}`}</style>
  </div>
);

const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
    <span className="text-[11px] text-gray-400">{label}</span>
    <span className="text-xs font-semibold text-white">{value}</span>
  </div>
);

const AddressPill: React.FC<{ address?: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  const short = `${address.slice(0,6)}…${address.slice(-4)}`;
  return (
    <button
      onClick={async () => { try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(()=>setCopied(false),900);} catch {} }}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-gray-200 hover:bg-white/10"
      title="Copy address"
    >
      {short} {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
};

const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 4 }) => (
  <div className="px-3 py-2 grid grid-cols-1 md:grid-cols-12 gap-1">
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className="h-3 rounded bg-white/10 md:col-span-3" />
    ))}
  </div>
);

/* =========================================================
   Types
   ========================================================= */
type Scope = "mine" | "all";
type TabKey = "referral" | "star" | "golden";

type ReferralLog = {
  txHash: `0x${string}`;
  blockNumber: bigint;
  user: Address;
  y: bigint; s: bigint; p: bigint;
  ts?: number;
};

type StarLog = {
  txHash: `0x${string}`;
  blockNumber: bigint;
  user: Address;
  level: number;
  amount: bigint;
  ts?: number;
};

type GSLog = {
  txHash: `0x${string}`;
  blockNumber: bigint;
  user: Address;
  amount: bigint;
  ts?: number;
};

type BaseProps = {
  proxy: Address;
  deployBlock?: bigint;
};

type ClaimsHubPanelProps = BaseProps & {
  defaultTab?: TabKey;
  yyDecimals?: number; // default 18
};

/* =========================================================
   Data hooks (per tab)
   ========================================================= */
function useReferralClaims({ proxy, deployBlock, userFilter }: BaseProps & { userFilter?: Address | null }) {
  const pc = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ReferralLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!pc || !proxy) return;
    setLoading(true); setError(null);
    try {
      let fromBlock = 0n;
      try { if (deployBlock && deployBlock>0n) fromBlock=deployBlock; else { const tip=await pc.getBlockNumber(); fromBlock=tip>120000n?tip-120000n:0n; } } catch {}
      const params: any = { address: proxy, event: ReferralRewardsClaimedEvent, fromBlock, toBlock: "latest" };
      if (userFilter) params.args = { user: userFilter };
      const raw = await pc.getLogs(params);

      const items: ReferralLog[] = raw.map((l) => {
        // @ts-ignore
        const a = (l as any).args;
        let user: Address | undefined, y: bigint | undefined, s: bigint | undefined, p: bigint | undefined;
        if (a && "user" in a) { user = a.user; y = a.yAmount; s = a.sAmount; p = a.pAmount; }
        else {
          try {
            const dec = decodeEventLog({ abi: [ReferralRewardsClaimedEvent], data: l.data, topics: l.topics }).args as any;
            user = dec.user; y = dec.yAmount; s = dec.sAmount; p = dec.pAmount;
          } catch {}
        }
        return { txHash: l.transactionHash!, blockNumber: l.blockNumber!, user: (user ?? "0x0000000000000000000000000000000000000000") as Address, y: y||0n, s: s||0n, p: p||0n };
      });

      const uniqBlocks = Array.from(new Set(items.map(i => i.blockNumber)));
      const tsMap = new Map<bigint, number>();
      await Promise.all(uniqBlocks.map(async (bn)=>{ try { const b=await pc.getBlock({ blockNumber: bn }); if (b?.timestamp) tsMap.set(bn, Number(b.timestamp)); } catch {} }));
      const withTs = items.map(i => ({ ...i, ts: tsMap.get(i.blockNumber) })).sort((a,b)=>Number(b.blockNumber-a.blockNumber));
      setLogs(withTs);
    } catch (e:any) { setError(e?.message ?? "Failed to read referral logs"); setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    if (!pc || !proxy) return;
    const params: any = {
      address: proxy,
      event: ReferralRewardsClaimedEvent,
      poll: true,
      onLogs: (newLogs:any[]) => {
        const next: ReferralLog[] = newLogs.map((l)=>{ // @ts-ignore
          const a=(l as any).args; return { txHash:l.transactionHash!, blockNumber:l.blockNumber!, user:a.user as Address, y:a.yAmount as bigint, s:a.sAmount as bigint, p:a.pAmount as bigint }; });
        const filtered = userFilter ? next.filter(n => n.user.toLowerCase() === userFilter.toLowerCase()) : next;
        if (!filtered.length) return;
        setLogs(prev => {
          const merged = [...filtered.map(x=>({ ...x, ts: undefined })), ...prev];
          const seen = new Set<string>();
          return merged.filter(i => { const k = `${i.txHash}-${i.blockNumber}-${i.user}-${i.y}-${i.s}-${i.p}`; if (seen.has(k)) return false; seen.add(k); return true; });
        });
      }
    };
    if (userFilter) params.args = { user: userFilter };
    const unwatch = pc.watchEvent(params);
    return () => { try { unwatch?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy, (userFilter||"").toLowerCase()]);

  const totals = useMemo(() => logs.reduce((acc,l)=>{ acc.y+=l.y; acc.s+=l.s; acc.p+=l.p; return acc; }, { y:0n, s:0n, p:0n }), [logs]);
  return { loading, logs, totals, error, refetch: fetchAll };
}

function useStarClaims({ proxy, deployBlock, userFilter }: BaseProps & { userFilter?: Address | null }) {
  const pc = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<StarLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!pc || !proxy) return;
    setLoading(true); setError(null);
    try {
      let fromBlock = 0n;
      try { if (deployBlock && deployBlock>0n) fromBlock=deployBlock; else { const tip=await pc.getBlockNumber(); fromBlock=tip>120000n?tip-120000n:0n; } } catch {}
      const params:any = { address: proxy, event: StarRewardClaimedEvent, fromBlock, toBlock: "latest" };
      if (userFilter) params.args = { user: userFilter };
      const raw = await pc.getLogs(params);

      const items: StarLog[] = raw.map((l)=>{ // @ts-ignore
        const a=(l as any).args; let user:Address|undefined; let level:number|undefined; let amount:bigint|undefined;
        if (a && "user" in a) { user=a.user as Address; level=Number(a.level); amount=a.amount as bigint; }
        else {
          try { const dec=decodeEventLog({ abi:[StarRewardClaimedEvent], data:l.data, topics:l.topics }).args as any;
            user=dec.user as Address; level=Number(dec.level); amount=dec.amount as bigint; } catch {}
        }
        return { txHash:l.transactionHash!, blockNumber:l.blockNumber!, user:(user??"0x0000000000000000000000000000000000000000") as Address, level:level??0, amount:amount||0n };
      });

      const uniqBlocks = Array.from(new Set(items.map(i=>i.blockNumber)));
      const tsMap = new Map<bigint, number>();
      await Promise.all(uniqBlocks.map(async (bn)=>{ try{ const b=await pc.getBlock({blockNumber:bn}); if(b?.timestamp) tsMap.set(bn, Number(b.timestamp)); }catch{} }));
      const withTs = items.map(i=>({ ...i, ts: tsMap.get(i.blockNumber) })).sort((a,b)=>Number(b.blockNumber-a.blockNumber));
      setLogs(withTs);
    } catch (e:any) { setError(e?.message ?? "Failed to read star logs"); setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(()=> {
    fetchAll();
    if (!pc || !proxy) return;
    const params:any = {
      address: proxy,
      event: StarRewardClaimedEvent,
      poll:true,
      onLogs:(newLogs:any[])=>{
        const next:StarLog[] = newLogs.map((l)=>{ // @ts-ignore
          const a=(l as any).args; return { txHash:l.transactionHash!, blockNumber:l.blockNumber!, user:a.user as Address, level:Number(a.level), amount:a.amount as bigint }; });
        const filtered = userFilter ? next.filter(n=> n.user.toLowerCase()===userFilter.toLowerCase()) : next;
        if (!filtered.length) return;
        setLogs(prev=>{
          const merged=[...filtered.map(x=>({ ...x, ts:undefined })), ...prev];
          const seen=new Set<string>();
          return merged.filter(i=>{ const k=`${i.txHash}-${i.blockNumber}-${i.user}-${i.level}-${i.amount}`; if(seen.has(k)) return false; seen.add(k); return true; });
        });
      }
    };
    if (userFilter) params.args = { user: userFilter };
    const unwatch = pc.watchEvent(params);
    return ()=>{ try{ unwatch?.(); }catch{} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy, (userFilter||"").toLowerCase()]);

  const totals = useMemo(()=>{
    const perLevel = new Map<number,bigint>(); let grand=0n;
    for(const l of logs){ perLevel.set(l.level, (perLevel.get(l.level)??0n)+l.amount); grand+=l.amount; }
    return { perLevel, grand };
  },[logs]);

  return { loading, logs, totals, error, refetch: fetchAll };
}

function useGoldenStarClaims({ proxy, deployBlock, userFilter }: BaseProps & { userFilter?: Address | null }) {
  const pc = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<GSLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!pc || !proxy) return;
    setLoading(true); setError(null);
    try {
      let fromBlock = 0n;
      try { if (deployBlock && deployBlock>0n) fromBlock=deployBlock; else { const tip=await pc.getBlockNumber(); fromBlock=tip>120000n?tip-120000n:0n; } } catch {}
      const params:any = { address: proxy, event: GoldenStarRewardClaimedEvent, fromBlock, toBlock: "latest" };
      if (userFilter) params.args = { user: userFilter };
      const raw = await pc.getLogs(params);

      const items: GSLog[] = raw.map((l)=>{ // @ts-ignore
        const a=(l as any).args; let user:Address|undefined; let amount:bigint|undefined;
        if (a && "user" in a) { user=a.user as Address; amount=a.amount as bigint; }
        else { try{ const dec=decodeEventLog({ abi:[GoldenStarRewardClaimedEvent], data:l.data, topics:l.topics }).args as any; user=dec.user as Address; amount=dec.amount as bigint; } catch{} }
        return { txHash:l.transactionHash!, blockNumber:l.blockNumber!, user:(user??"0x0000000000000000000000000000000000000000") as Address, amount:amount||0n };
      });

      const uniqBlocks = Array.from(new Set(items.map(i=>i.blockNumber)));
      const tsMap = new Map<bigint, number>();
      await Promise.all(uniqBlocks.map(async (bn)=>{ try{ const b=await pc.getBlock({blockNumber:bn}); if(b?.timestamp) tsMap.set(bn, Number(b.timestamp)); }catch{} }));
      const withTs = items.map(i=>({ ...i, ts: tsMap.get(i.blockNumber) })).sort((a,b)=>Number(b.blockNumber-a.blockNumber));
      setLogs(withTs);
    } catch (e:any) { setError(e?.message ?? "Failed to read golden star logs"); setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(()=> {
    fetchAll();
    if (!pc || !proxy) return;
    const params:any = {
      address: proxy,
      event: GoldenStarRewardClaimedEvent,
      poll:true,
      onLogs:(newLogs:any[])=>{
        const next:GSLog[] = newLogs.map((l)=>{ // @ts-ignore
          const a=(l as any).args; return { txHash:l.transactionHash!, blockNumber:l.blockNumber!, user:a.user as Address, amount:a.amount as bigint }; });
        const filtered = userFilter ? next.filter(n=> n.user.toLowerCase()===userFilter.toLowerCase()) : next;
        if (!filtered.length) return;
        setLogs(prev=>{
          const merged=[...filtered.map(x=>({ ...x, ts:undefined })), ...prev];
          const seen=new Set<string>();
          return merged.filter(i=>{ const k=`${i.txHash}-${i.blockNumber}-${i.user}-${i.amount}`; if(seen.has(k)) return false; seen.add(k); return true; });
        });
      }
    };
    if (userFilter) params.args = { user: userFilter };
    const unwatch = pc.watchEvent(params);
    return ()=>{ try{ unwatch?.(); }catch{} };
    // eslint-disable-next-line react-hooks/exducependeps
  }, [proxy, (userFilter||"").toLowerCase()]);

  const total = useMemo(()=> logs.reduce((acc,l)=> acc + l.amount, 0n), [logs]);
  return { loading, logs, total, error, refetch: fetchAll };
}

/* =========================================================
   Panels (content per tab)
   ========================================================= */
const ReferralTab: React.FC<BaseProps & { scope: Scope; yyDecimals?: number; }> = ({ proxy, deployBlock, scope }) => {
  const { address } = useAccount();
  const { loading, logs, totals, error, refetch } = useReferralClaims({
    proxy, deployBlock, userFilter: scope==="mine" ? (address ?? null) : null
  });

  const totYY = Number(formatUnits(totals.y, 18));
  const totSY = Number(formatUnits(totals.s, 18));
  const totPY = Number(formatUnits(totals.p, 18));

  return (
    <>
      {/* Header row */}
      <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5 rounded-t-xl">
        <div className="col-span-4">User</div>
        <div className="col-span-2 text-right">YY</div>
        <div className="col-span-2 text-right">SY</div>
        <div className="col-span-2 text-right">PY</div>
        <div className="col-span-2 text-right">Block / Time</div>
      </div>

      <div className="max-h-[60vh] overflow-auto divide-y divide-white/5 rounded-b-xl">
        {loading && (<><div className="p-4"><Progress/></div>{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={5}/>)}</>)}
        {!loading && error && <div className="p-4 text-rose-300 text-sm">{error}</div>}
        {!loading && !error && logs.length===0 && (
          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-200">
              {scope==="mine" ? "No referral claims yet." : "No ReferralRewardsClaimed events found."}
            </div>
          </div>
        )}

        {!loading && !error && logs.map((l, idx) => {
          const y = Number(formatUnits(l.y, 18));
          const s = Number(formatUnits(l.s, 18));
          const p = Number(formatUnits(l.p, 18));
          const when = l.ts ? new Date(l.ts * 1000) : undefined;

          return (
            <React.Fragment key={`${l.txHash}-${idx}`}>
              {/* Desktop row */}
              <div className="px-3 py-2 hidden md:grid grid-cols-12 gap-1 text-xs text-gray-200">
                <div className="col-span-4 font-mono break-all">{l.user}</div>
                <div className="col-span-2 text-right">YY {y.toLocaleString()}</div>
                <div className="col-span-2 text-right">SY {s.toLocaleString()}</div>
                <div className="col-span-2 text-right">PY {p.toLocaleString()}</div>
                <div className="col-span-2 text-right text-gray-400">#{l.blockNumber.toString()} {when ? "• " + when.toLocaleString() : ""}</div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden p-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="font-mono text-[11px] text-gray-300 break-all">{l.user}</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-indigo-200">YY {y.toLocaleString()}</div>
                    <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-indigo-200">SY {s.toLocaleString()}</div>
                    <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-indigo-200">PY {p.toLocaleString()}</div>
                  </div>
                  <div className="text-[11px] text-gray-400 text-right">#{l.blockNumber.toString()} {when ? "• " + when.toLocaleString() : ""}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Totals strip */}
      <div className="px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2">
        <StatPill label="YY" value={totYY.toLocaleString()} />
        <StatPill label="SY" value={totSY.toLocaleString()} />
        <StatPill label="PY" value={totPY.toLocaleString()} />
      </div>
    </>
  );
};

const StarTab: React.FC<BaseProps & { scope: Scope; yyDecimals?: number; }> = ({ proxy, deployBlock, scope, yyDecimals = 18 }) => {
  const { address } = useAccount();
  const { loading, logs, totals, error, refetch } = useStarClaims({
    proxy, deployBlock, userFilter: scope==="mine" ? (address ?? null) : null
  });

  const grandYY = Number(formatUnits(totals.grand, yyDecimals));
  const L = (n:number) => Number(formatUnits(totals.perLevel.get(n) ?? 0n, yyDecimals));

  return (
    <>
      <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5 rounded-t-xl">
        <div className="md:col-span-4">User</div>
        <div className="md:col-span-2 text-right">Level</div>
        <div className="md:col-span-3 text-right">YY</div>
        <div className="md:col-span-3 text-right">Block / Time</div>
      </div>

      <div className="max-h-[60vh] overflow-auto divide-y divide-white/5 rounded-b-xl">
        {loading && (<><div className="p-4"><Progress/></div>{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={4}/>)}</>)}
        {!loading && error && <div className="p-4 text-rose-300 text-sm">{error}</div>}
        {!loading && !error && logs.length===0 && (
          <div className="p-6"><div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-200">
            {scope==="mine" ? "No star level claims yet." : "No StarRewardClaimed events found."}
          </div></div>
        )}

        {!loading && !error && logs.map((l,idx)=>{
          const yy = Number(formatUnits(l.amount, yyDecimals));
          const when = l.ts ? new Date(l.ts*1000) : undefined;
          return (
            <React.Fragment key={`${l.txHash}-${idx}`}>
              <div className="px-3 py-2 hidden md:grid grid-cols-12 gap-1 text-xs text-gray-200">
                <div className="md:col-span-4 font-mono break-all">{l.user}</div>
                <div className="md:col-span-2 text-right">L{l.level}</div>
                <div className="md:col-span-3 text-right">YY {yy.toLocaleString()}</div>
                <div className="md:col-span-3 text-right text-gray-400">#{l.blockNumber.toString()} {when?"• "+when.toLocaleString():""}</div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden p-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="font-mono text-[11px] text-gray-300 break-all">{l.user}</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-indigo-200">Level L{l.level}</div>
                    <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-indigo-200">YY {yy.toLocaleString()}</div>
                  </div>
                  <div className="text-[11px] text-gray-400 text-right">#{l.blockNumber.toString()} {when?"• "+when.toLocaleString():""}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2">
        <StatPill label="Total YY" value={grandYY.toLocaleString()} />
        <StatPill label="L1" value={L(1).toLocaleString()} />
        <StatPill label="L2" value={L(2).toLocaleString()} />
        <StatPill label="L3" value={L(3).toLocaleString()} />
        <StatPill label="L4" value={L(4).toLocaleString()} />
        <StatPill label="L5" value={L(5).toLocaleString()} />
      </div>
    </>
  );
};

const GoldenTab: React.FC<BaseProps & { scope: Scope; yyDecimals?: number; }> = ({ proxy, deployBlock, scope, yyDecimals = 18 }) => {
  const { address } = useAccount();
  const { loading, logs, total, error, refetch } = useGoldenStarClaims({
    proxy, deployBlock, userFilter: scope==="mine" ? (address ?? null) : null
  });

  const totYY = Number(formatUnits(total, yyDecimals));

  return (
    <>
      <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5 rounded-t-xl">
        <div className="md:col-span-5">User</div>
        <div className="md:col-span-4 text-right">YY</div>
        <div className="md:col-span-3 text-right">Block / Time</div>
      </div>

      <div className="max-h-[60vh] overflow-auto divide-y divide-white/5 rounded-b-xl">
        {loading && (<><div className="p-4"><Progress/></div>{Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={3}/>)}</>)}
        {!loading && error && <div className="p-4 text-rose-300 text-sm">{error}</div>}
        {!loading && !error && logs.length===0 && (
          <div className="p-6"><div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-200">
            {scope==="mine" ? "No golden star claims yet." : "No GoldenStarRewardClaimed events found."}
          </div></div>
        )}

        {!loading && !error && logs.map((l,idx)=>{
          const yy = Number(formatUnits(l.amount, yyDecimals));
          const when = l.ts ? new Date(l.ts*1000) : undefined;
          return (
            <React.Fragment key={`${l.txHash}-${idx}`}>
              <div className="px-3 py-2 hidden md:grid grid-cols-12 gap-1 text-xs text-gray-200">
                <div className="md:col-span-5 font-mono break-all">{l.user}</div>
                <div className="md:col-span-4 text-right">YY {yy.toLocaleString()}</div>
                <div className="md:col-span-3 text-right text-gray-400">#{l.blockNumber.toString()} {when?"• "+when.toLocaleString():""}</div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden p-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="font-mono text-[11px] text-gray-300 break-all">{l.user}</div>
                  <div className="rounded-lg bg-[#0f1424] px-2 py-1 text-xs text-center text-indigo-200">YY {yy.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400 text-right">#{l.blockNumber.toString()} {when?"• "+when.toLocaleString():""}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2">
        <StatPill label="Total YY" value={totYY.toLocaleString()} />
      </div>
    </>
  );
};

/* =========================================================
   MAIN: ClaimsHubPanel
   ========================================================= */
const ClaimsHubPanel: React.FC<ClaimsHubPanelProps> = ({
  proxy,
  deployBlock,
  defaultTab = "referral",
  yyDecimals = 18,
}) => {
  const { address } = useAccount();
  const [tab, setTab] = useState<TabKey>(defaultTab);
  const [scope, setScope] = useState<Scope>("mine");

  // Tab config for pretty labels + icons
  const tabs: Array<{ key: TabKey; label: string; Icon: React.FC<any>; accent: string }> = [
    { key: "referral", label: "Referral", Icon: Sparkles, accent: "from-purple-500 to-blue-500" },
    { key: "star",     label: "Star Levels", Icon: Star,  accent: "from-amber-400 to-rose-500" },
    { key: "golden",   label: "Golden Star", Icon: Crown, accent: "from-yellow-400 to-amber-500" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10
                    bg-gradient-to-b from-[#0b1222] to-[#0a0f1c]">
      {/* Glow ring */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl"
           style={{ background: "linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02))" }} />

      {/* Toolbar (sticky) */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1120]/90 backdrop-blur">
        <div className="px-3 sm:px-4 py-3 flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
            {tabs.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={[
                    "group px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition",
                    active ? "bg-white/15 text-white ring-1 ring-white/60" : "text-gray-300 hover:text-white"
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4 opacity-90" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Scope */}
          <div className="ml-auto inline-flex rounded-xl overflow-hidden border border-white/10">
            <button
              onClick={() => setScope("mine")}
              className={"px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " + (scope==="mine" ? "bg-white/15 text-white" : "bg-white/5 text-gray-300 hover:text-white")}
              title="Show only my claims"><User className="w-4 h-4" /> Mine</button>
            <button
              onClick={() => setScope("all")}
              className={"px-3 py-1.5 text-xs font-semibold flex items-center gap-1 " + (scope==="all" ? "bg-white/15 text-white" : "bg-white/5 text-gray-300 hover:text-white")}
              title="Show all users"><Users className="w-4 h-4" /> All</button>
          </div>
        </div>

        {/* Meta line */}
        <div className="px-3 sm:px-4 pb-3 flex flex-wrap items-center gap-2">
          <StatPill label="Network" value="Base Sepolia" />
          {deployBlock ? <StatPill label="Since block" value={deployBlock.toString()} /> : null}
          {scope === "mine" && <AddressPill address={address} />}
          <div className="ml-auto text-[11px] text-gray-400 flex items-center gap-2">
            <Search className="w-4 h-4" /> Live updates enabled
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f1424] overflow-hidden">
          {tab === "referral" && <ReferralTab proxy={proxy} deployBlock={deployBlock} scope={scope} />}
          {tab === "star"     && <StarTab     proxy={proxy} deployBlock={deployBlock} scope={scope} yyDecimals={yyDecimals} />}
          {tab === "golden"   && <GoldenTab   proxy={proxy} deployBlock={deployBlock} scope={scope} yyDecimals={yyDecimals} />}
        </div>
      </div>
    </div>
  );
};

export default ClaimsHubPanel;
