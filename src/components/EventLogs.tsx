// src/components/EventLogs.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  DollarSign,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { Address, formatUnits, parseAbiItem } from "viem";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import clsx from "clsx";

/* =========================
   Env / config
========================= */
const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as const);

// Set to your proxy's deployment block to keep scans small
const DEPLOY_BLOCK = BigInt(import.meta.env.VITE_DEPLOY_BLOCK ?? "0");

// History chunk size (≤ your RPC provider's max range, e.g., 50k)
const LOGS_CHUNK = Number(import.meta.env.VITE_LOGS_CHUNK || 40_000);

// yYearn-like display (adjust if needed)
const YY_DECIMALS = Number(import.meta.env.VITE_YY_DECIMALS || 18);
const YY_SYMBOL = import.meta.env.VITE_YY_SYMBOL || "YY";

/* =========================
   Types / theme
========================= */
type EventType = "stake" | "referral" | "earnings" | "unstake";
type EventItem = {
  id: string;
  type: EventType;
  title: string;
  description: string;
  amount?: string;
  timestamp: Date;
  color?: "green" | "blue" | "purple" | "orange";
  tx?: `0x${string}`;
  logIndex?: number;
};

const ICONS: Record<EventType, React.ComponentType<any>> = {
  stake: ArrowUpRight,
  referral: Users,
  earnings: DollarSign,
  unstake: ArrowDownLeft,
};

const THEME: Record<
  NonNullable<EventItem["color"]>,
  { bg: string; text: string; ring: string }
> = {
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    ring: "ring-green-400/40 dark:ring-green-500/30",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-400/40 dark:ring-blue-500/30",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-400/40 dark:ring-purple-500/30",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    ring: "ring-orange-400/40 dark:ring-orange-500/30",
  },
};

/* =========================
   Helpers
========================= */
const fmtYY = (raw: bigint) =>
  `${Number(formatUnits(raw, YY_DECIMALS)).toLocaleString()} ${YY_SYMBOL}`;

const short = (addr: Address) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const formatRelative = (d: Date) => {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const day = Math.floor(h / 24);
  return `${day}d`;
};

const sectionLabel = (d: Date) => {
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const y = new Date();
  y.setDate(today.getDate() - 1);

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, y)) return "Yesterday";
  return d.toLocaleDateString();
};

const useGrouped = (events: EventItem[]) =>
  useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const groups: Record<string, EventItem[]> = {};
    for (const e of sorted) {
      const k = sectionLabel(e.timestamp);
      if (!groups[k]) groups[k] = [];
      groups[k].push(e);
    }
    return groups;
  }, [events]);

/* =========================
   Copyable
========================= */
const Copyable: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        } catch {}
      }}
      className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      title="Copy"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" /> Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> Copy
        </>
      )}
    </button>
  );
};

/* =========================
   Filter chips
========================= */
const FILTERS: { key: "all" | EventType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "stake", label: "Stake" },
  { key: "referral", label: "Referral" },
  { key: "earnings", label: "Earnings" },
  { key: "unstake", label: "Unstake" },
];

/* =========================
   Optional: restrict event decoding
========================= */
const EVENTS = [
  parseAbiItem(
    "event Staked(address indexed user, uint16 packageId, uint256 amount, uint256 stakeIndex)"
  ),
  parseAbiItem(
    "event Unstaked(address indexed user, uint256 stakeIndex, uint256 amount)"
  ),
  parseAbiItem(
    "event APRClaimed(address indexed user, uint256 stakeIndex, uint16 packageId, uint256 baseAPR, uint256 netReward)"
  ),
  parseAbiItem(
    "event ReferralAssigned(address indexed user, address indexed referrer)"
  ),
  parseAbiItem(
    "event ReferralRewardDistributed(address indexed referrer, uint8 level, uint256 amount, address rewardToken)"
  ),
  parseAbiItem(
    "event ReferralRewardsClaimed(address indexed user, uint256 yAmount, uint256 sAmount, uint256 pAmount)"
  ),
  parseAbiItem(
    "event StarRewardDistributed(address indexed user, uint8 level, uint256 amount)"
  ),
  parseAbiItem(
    "event StarRewardClaimed(address indexed user, uint8 level, uint256 amount)"
  ),
  parseAbiItem(
    "event GoldenStarRewardDistributed(address indexed user, uint256 amount, uint256 cumulative, uint256 cap)"
  ),
  parseAbiItem(
    "event GoldenStarRewardClaimed(address indexed user, uint256 amount)"
  ),
  parseAbiItem(
    "event GoldenStarActivated(address indexed user, uint256 activatedAt)"
  ),
];

/* =========================
   Watermark icon
========================= */
const IconYY: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="15" fill="#FFFFFF" />
    <circle cx="16" cy="16" r="13.5" fill="#2F6BFF" />
    <circle cx="16" cy="16" r="10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <path d="M16 9 L16 22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12 L11.5 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12 L20.5 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* =========================
   Component
========================= */
export default function EventLogs({
  account,
  strictAccount = true,
}: {
  account?: Address;
  strictAccount?: boolean; // if true, only show events that involve the given/connected wallet
}) {
  const chainId = useChainId();
  const { address: connected } = useAccount();
  const user = (account || connected) as Address | undefined;

  const client = usePublicClient({ chainId });

  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<EventItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const unmountedRef = useRef(false);

  const isMe = (addr: Address | string | undefined) =>
    !!user && !!addr && addr.toLowerCase() === user.toLowerCase();

  /* -------- Map decoded logs → UI items -------- */
  const toItem = async (log: any): Promise<EventItem | null> => {
    try {
      const name = log.eventName as string | undefined;
      const args = (log.args || {}) as Record<string, any>;
      if (!name) return null;

      // strict filter by wallet involvement
      const touchesUser = (() => {
        switch (name) {
          case "Staked":
          case "Unstaked":
          case "APRClaimed":
          case "ReferralRewardsClaimed":
          case "StarRewardDistributed":
          case "StarRewardClaimed":
          case "GoldenStarRewardDistributed":
          case "GoldenStarRewardClaimed":
          case "GoldenStarActivated":
            return isMe(args.user);
          case "ReferralAssigned":
            return isMe(args.user) || isMe(args.referrer);
          case "ReferralRewardDistributed":
            return isMe(args.referrer);
          default:
            return false;
        }
      })();

      if (strictAccount && user && !touchesUser) return null;

      const block =
        log.blockHash
          ? await client.getBlock({ blockHash: log.blockHash })
          : await client.getBlock({ blockNumber: log.blockNumber });

      const ts = new Date(Number(block.timestamp) * 1000);
      const uid = `${log.transactionHash}-${log.logIndex}`;

      switch (name) {
        case "Staked": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "stake",
            title: "Package Staked",
            description: `Package #${args.packageId} • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "green",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "Unstaked": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "unstake",
            title: "Unstaked",
            description: `Stake #${args.stakeIndex} • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "orange",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "APRClaimed": {
          const net = BigInt(args.netReward ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "APR Claimed",
            description: `Stake #${args.stakeIndex} • Pkg #${args.packageId}`,
            amount: fmtYY(net),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "ReferralAssigned": {
          const who = args.user as Address;
          const ref = args.referrer as Address;
          const desc = isMe(who)
            ? `Your referrer • ${ref}`
            : `You referred • ${who}`;
          return {
            id: uid,
            type: "referral",
            title: "Referral Linked",
            description: desc,
            timestamp: ts,
            color: "blue",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "ReferralRewardDistributed": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "Referral Earnings",
            description: `Level ${args.level} • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "ReferralRewardsClaimed": {
          const y = BigInt(args.yAmount ?? 0);
          const s = BigInt(args.sAmount ?? 0);
          const p = BigInt(args.pAmount ?? 0);
          const total = y + s + p;
          return {
            id: uid,
            type: "earnings",
            title: "Referral Rewards Claimed",
            description: `y/s/p total • ${fmtYY(total)}`,
            amount: fmtYY(total),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "StarRewardDistributed": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "Star Earnings",
            description: `Level ${args.level} • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "StarRewardClaimed": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "Star Rewards Claimed",
            description: `Level ${args.level} • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "GoldenStarRewardDistributed": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "Golden Star Earnings",
            description: `Distributed • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "GoldenStarRewardClaimed": {
          const amt = BigInt(args.amount ?? 0);
          return {
            id: uid,
            type: "earnings",
            title: "Golden Star Claimed",
            description: `Claimed • ${fmtYY(amt)}`,
            amount: fmtYY(amt),
            timestamp: ts,
            color: "purple",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        case "GoldenStarActivated": {
          const who = args.user as Address;
          return {
            id: uid,
            type: "referral",
            title: "Golden Star Activated",
            description: `Congrats • ${short(who)}`,
            timestamp: ts,
            color: "blue",
            tx: log.transactionHash,
            logIndex: Number(log.logIndex),
          };
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  /* -------- Chunked history loader (≤ RPC range) -------- */
  useEffect(() => {
    unmountedRef.current = false;
    setErr(null);

    (async () => {
      try {
        if (!client || !PROXY) return;

        const latest = await client.getBlockNumber();
        // If no DEPLOY_BLOCK provided, default to a modest recent window (e.g., 120k)
        const fallbackFrom =
          latest > 120_000n ? latest - 120_000n : (0n as bigint);
        const from = DEPLOY_BLOCK > 0n ? DEPLOY_BLOCK : fallbackFrom;

        const all: any[] = [];
        for (let start = from; start <= latest; ) {
          const end = start + BigInt(LOGS_CHUNK);
          const toBlock = end > latest ? latest : end;

          // Using specific EVENTS reduces payload and encoding work
          const logs = await client.getLogs({
            address: PROXY,
            fromBlock: start,
            toBlock,
            events: EVENTS,
          });

          all.push(...logs);
          start = toBlock + 1n;

          if (unmountedRef.current) return;
          // brief delay to avoid throttle
          await new Promise((r) => setTimeout(r, 80));
        }

        const mapped = await Promise.all(all.map(toItem));
        const valid = mapped.filter(Boolean) as EventItem[];
        if (!unmountedRef.current) setItems(valid);
      } catch (e: any) {
        if (!unmountedRef.current)
          setErr(e?.message || "Failed to load events");
      }
    })();

    return () => {
      unmountedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, chainId, user, strictAccount]);

  /* -------- Live event stream -------- */
  useEffect(() => {
    if (!client || !PROXY) return;

    const unwatch = client.watchContractEvent({
      address: PROXY,
      abi: STAKING_ABI as any,
      // eventName: undefined (listen to all ABI events)
      onLogs: async (decodedLogs) => {
        const mapped = await Promise.all(decodedLogs.map(toItem));
        const valid = (mapped.filter(Boolean) as EventItem[]);
        if (valid.length === 0) return;

        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          for (const it of valid) if (!seen.has(it.id)) merged.push(it);
          return merged;
        });
      },
      poll: true, // switch to false if your provider supports websockets well
    });

    return () => {
      try {
        unwatch?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, chainId, user, strictAccount]);

  /* -------- UI filtering -------- */
  const filtered = useMemo(() => {
    return items.filter((e) => {
      const passType = filter === "all" ? true : e.type === filter;
      const passText =
        q.trim().length === 0
          ? true
          : `${e.title} ${e.description}`.toLowerCase().includes(q.toLowerCase());
      return passType && passText;
    });
  }, [items, filter, q]);

  const grouped = useGrouped(filtered);

  /* -------- Render -------- */
  return (
    <section className="mt-8">
      {/* Header / search / filters inside a glass card */}
      <div className="rounded-2xl overflow-hidden bg-white/[0.04] ring-1 ring-white/10 shadow-2xl">
        <div className="px-4 md:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-300" />
            <h3 className="text-base md:text-lg font-semibold text-white">
              Event Activity
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search events, addresses…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-lg bg-white/10 text-sm text-white border border-transparent focus:border-purple-400/50 outline-none placeholder:text-white/60"
              />
            </div>
          </div>
        </div>

        <div className="px-3 md:px-6 py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
                <tr className="[&>th]:px-5 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:tracking-wide [&>th]:uppercase [&>th]:text-white/60">
                  <th>Event</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {Object.keys(grouped).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-white/60">
                      {err ? `Error: ${err}` : "No events found."}
                    </td>
                  </tr>
                ) : (
                  Object.entries(grouped).map(([section, events]) => (
                    <React.Fragment key={section}>
                      <tr>
                        <td colSpan={4} className="px-5 py-2 text-[11px] text-white/70">
                          {section}
                        </td>
                      </tr>
                      {events
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((e) => {
                          const Icon = ICONS[e.type];
                          const theme = THEME[e.color || "purple"];
                          const addrMatch = e.description.match(/0x[a-fA-F0-9]{40}/);
                          const addr = addrMatch?.[0] as Address | undefined;
                          return (
                            <tr key={e.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-5 py-4 align-middle">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={clsx(
                                      "inline-flex items-center justify-center w-7 h-7 rounded-full ring-2",
                                      theme.ring,
                                      theme.bg
                                    )}
                                  >
                                    <Icon className={clsx("w-3.5 h-3.5", theme.text)} />
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{e.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                      {e.type}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <span className="text-white/80">{e.description}</span>
                                {addr && (
                                  <>
                                    {" "}
                                    <Copyable text={addr} />
                                  </>
                                )}
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <span className="font-semibold">{e.amount ?? "-"}</span>
                              </td>
                              <td className="px-5 py-4 align-middle text-white/70">
                                {formatRelative(e.timestamp)}
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: glass cards carousel */}
        <div className="md:hidden -mx-4 px-4">
          {Object.keys(grouped).length === 0 ? (
            <div className="p-6 text-center text-white/70">
              {err ? `Error: ${err}` : "No events found."}
            </div>
          ) : (
            Object.entries(grouped).map(([section, events]) => (
              <div key={section} className="mt-4">
                <div className="px-1 py-1 text-[11px] text-white/70">{section}</div>
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
                  {events
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((e) => {
                      const Icon = ICONS[e.type];
                      const theme = THEME[e.color || "purple"];
                      const addrMatch = e.description.match(/0x[a-fA-F0-9]{40}/);
                      const addr = addrMatch?.[0] as Address | undefined;

                      return (
                        <div
                          key={e.id}
                          className="snap-center shrink-0 w-[88%] relative rounded-3xl p-4 sm:p-5 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]"
                        >
                          {/* glow & watermark */}
                          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10">
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-white/10 via-white/0 to-white/10 opacity-60" />
                          </div>
                          <div className="pointer-events-none absolute bottom-3 right-3 opacity-10">
                            <IconYY className="w-16 h-16" />
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={clsx(
                                    "inline-flex items-center justify-center w-7 h-7 rounded-full ring-2",
                                    theme.ring,
                                    theme.bg
                                  )}
                                >
                                  <Icon className={clsx("w-3.5 h-3.5", theme.text)} />
                                </span>
                                <h3 className="text-base font-semibold text-white truncate">
                                  {e.title}
                                </h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                  {e.type}
                                </span>
                              </div>
                              <p className="text-[13px] text-white/80 mt-1">
                                {e.description}{" "}
                                {addr && (
                                  <>
                                    &nbsp;
                                    <Copyable text={addr} />
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {e.amount && (
                                <div className="text-sm font-semibold text-white">
                                  {e.amount}
                                </div>
                              )}
                              <div className="text-[11px] text-white/70">
                                {formatRelative(e.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/70">
            Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
          <button className="text-xs font-medium text-purple-300 hover:text-purple-200">
            View all
          </button>
        </div>
      </div>
    </section>
  );
}
