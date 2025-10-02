// src/components/ReferralShareModal.tsx
import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Copy, Check, X, Users, Gift, UserCheck, UserX, Wallet, Search, Filter,
} from "lucide-react";

import { useReferralContext } from "../contexts/hooks/useReferralContext";
import { useOnchainReferralProfile, fmt } from "@/hooks/useOnchainReferralProfile";
import { useResolvedReferrer } from "@/hooks/useResolvedReferrer";

/* ===== Mini loaders (lightweight) ===== */
const SkeletonBar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`h-3 w-full rounded bg-white/10 relative overflow-hidden ${className ?? ""}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
  </div>
);

/* ============================== */
/*            Main UI             */
/* ============================== */

type ReferralShareModalProps = { onClose: () => void };
const PAGE_SIZE = 12;
const MAX_LEVEL = 15;

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [onlyNonEmpty, setOnlyNonEmpty] = useState(true);

  const { address } = useAccount();
  const { clearReferral } = useReferralContext();
  const resolved = useResolvedReferrer();

  const {
    loading,
    error,
    refRows = [],
    decimals,
    myTotalYY,
    levels,
  } = useOnchainReferralProfile(address as `0x${string}` | undefined);

  /* Build a map: level -> { totalYY, rows } */
  const levelData = useMemo(() => {
    const map = new Map<number, { totalYY: bigint; rows: typeof refRows }>();
    if (Array.isArray(levels) && levels.length) {
      for (const L of levels) {
        map.set(L.level, { totalYY: L.totalYY ?? 0n, rows: (L.rows ?? []) as typeof refRows });
      }
    } else {
      const total = (refRows ?? []).reduce<bigint>((acc, r) => acc + (r.totalYY ?? 0n), 0n);
      map.set(1, { totalYY: total, rows: refRows ?? [] });
    }
    return map;
  }, [levels, refRows]);

  const hasLevel = (lvl: number) =>
    levelData.has(lvl) && (levelData.get(lvl)?.rows?.length ?? 0) > 0;

  const filteredLevels = useMemo(() => {
    const ids = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);
    return onlyNonEmpty ? ids.filter(hasLevel) : ids;
  }, [onlyNonEmpty, levelData]);

  // Keep selection valid
  const effectiveLevel = levelData.has(level) ? level : (filteredLevels[0] ?? 1);

  // Filter rows by query (address contains, case-insensitive)
  const rowsLevelRaw = levelData.get(effectiveLevel)?.rows ?? [];
  const q = query.trim().toLowerCase();
  const rowsLevel = q
    ? rowsLevelRaw.filter((r) => r.addr.toLowerCase().includes(q))
    : rowsLevelRaw;

  const totalPages = Math.max(1, Math.ceil(rowsLevel.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = rowsLevel.slice(start, start + PAGE_SIZE);
  const selectedLevelTotalYY = levelData.get(effectiveLevel)?.totalYY ?? 0n;

  const referralLink = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/ref/${address ?? ""}`;
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/65">
      {/* Full-bleed container for max space */}
      <div className="fixed inset-0 flex flex-col">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0f1424]/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <div className="shrink-0 rounded-xl p-2 bg-gradient-to-br from-purple-500 to-blue-600">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              Your YearnTogether Profile
            </h3>
            <p className="text-[11px] text-gray-400">Referrals • Levels • Share link</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content grid */}
        <div className="flex-1 min-h-0 grid grid-rows-[auto_1fr] sm:grid-rows-1 sm:grid-cols-[240px_1fr]">
          {/* Left rail: levels + share + total */}
          <aside className="border-b sm:border-b-0 sm:border-r border-white/10 bg-[#0f1424] overflow-auto">
            {/* Referrer banner */}
            {resolved.status !== "none" && (
              <div className="m-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-emerald-300">
                      {resolved.status === "whitelisted"
                        ? "Whitelisted (no referrer)"
                        : resolved.status === "pending"
                        ? "Referred by (pending)"
                        : resolved.status === "default"
                        ? "Default referrer (applies on first stake)"
                        : "Referred by"}
                    </div>
                    <div className="text-xs font-mono text-gray-300 truncate">
                      {resolved.displayReferrerAddr
                        ? `${resolved.displayReferrerAddr.slice(0, 8)}…${resolved.displayReferrerAddr.slice(-6)}`
                        : "—"}
                    </div>
                  </div>
                  {resolved.status === "pending" && (
                    <button
                      onClick={() => {
                        try { clearReferral(); } catch {}
                        try { localStorage.removeItem("referral:context"); } catch {}
                        window.location.reload();
                      }}
                      title="Remove referral from this session"
                      className="ml-auto rounded-lg p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Share link card */}
            <div className="mx-3 mb-3 rounded-xl bg-[#111834] border border-white/10 p-3">
              <div className="text-xs font-semibold text-white">Your Referral Link</div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#0b122a] px-2 py-1.5">
                <span className="truncate text-[11px] text-gray-300 flex-1">{referralLink}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Total staked (compact) */}
            <div className="mx-3 mb-3 rounded-xl bg-[#111834] border border-white/10 p-3">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Wallet className="w-4 h-4" />
                Your Total Staked
              </div>
              <div className="mt-1 text-lg font-bold text-white">
                {loading ? <SkeletonBar className="h-5 w-24" /> : `${fmt(myTotalYY ?? 0n, decimals?.yy)} YY`}
              </div>
            </div>

            {/* Level selector */}
            <div className="mx-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-white">Levels</div>
                <label className="flex items-center gap-1 text-[11px] text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={onlyNonEmpty}
                    onChange={(e) => {
                      setOnlyNonEmpty(e.target.checked);
                      // Reset page and pick a valid level if current disappears
                      if (e.target.checked && !hasLevel(level)) {
                        const first = filteredLevels[0];
                        if (first) setLevel(first);
                      }
                    }}
                  />
                  <Filter className="w-3.5 h-3.5" />
                  Non-empty
                </label>
              </div>

              {/* Desktop: vertical rail; Mobile: chip grid */}
              <div className="hidden sm:block sticky top-3 space-y-1 max-h-[50vh] overflow-auto pr-1">
                {filteredLevels.map((lvl) => {
                  const active = lvl === effectiveLevel;
                  const count = levelData.get(lvl)?.rows?.length ?? 0;
                  const sumYY = levelData.get(lvl)?.totalYY ?? 0n;
                  return (
                    <button
                      key={lvl}
                      onClick={() => { setLevel(lvl); setPage(1); }}
                      className={[
                        "w-full text-left rounded-lg px-3 py-2 border text-xs",
                        active
                          ? "bg-gradient-to-r from-purple-600/70 to-blue-600/70 border-white/20 text-white"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200",
                      ].join(" ")}
                      title={`Level ${lvl}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Level {lvl}</span>
                        <span className="text-[10px] text-gray-300">{count}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-indigo-200">
                        YY {fmt(sumYY, decimals?.yy)}
                      </div>
                    </button>
                  );
                })}
                {filteredLevels.length === 0 && (
                  <div className="text-[11px] text-gray-500">No levels to show.</div>
                )}
              </div>

              {/* Mobile grid of chips */}
              <div className="sm:hidden grid grid-cols-6 gap-1">
                {filteredLevels.map((lvl) => {
                  const active = lvl === effectiveLevel;
                  return (
                    <button
                      key={lvl}
                      onClick={() => { setLevel(lvl); setPage(1); }}
                      className={[
                        "rounded-md h-8 text-[11px] font-medium",
                        active
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                          : "bg-white/5 text-gray-200",
                      ].join(" ")}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right pane: big data area */}
          <main className="min-w-0 bg-[#0b1022]">
            {/* Toolbar */}
            <div className="px-3 sm:px-5 py-3 border-b border-white/10 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4 text-blue-300" />
                <div className="text-sm font-semibold">
                  Level {effectiveLevel} Referrals
                </div>
                <div className="text-[11px] text-gray-400">
                  {loading ? "…" : `${rowsLevel.length} referees`}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                  <span>Total YY</span>
                  <span className="font-mono font-semibold text-emerald-400 text-sm">
                    {loading ? "…" : fmt(selectedLevelTotalYY, decimals?.yy)}
                  </span>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Search address…"
                    className="bg-transparent outline-none text-xs text-gray-100 placeholder:text-gray-500 w-36 sm:w-60"
                  />
                </div>
              </div>
            </div>

            {/* Table area */}
            <div className="p-3 sm:p-5">
              {/* Desktop table */}
              <div className="hidden sm:grid grid-cols-12 px-3 py-2 text-[11px] text-gray-400 bg-white/5 rounded-t-lg">
                <div className="col-span-7">Address</div>
                <div className="col-span-2 text-right">Stakes</div>
                <div className="col-span-3 text-right">Total YY</div>
              </div>

              <div className="hidden sm:block rounded-b-lg overflow-hidden">
                <div className="max-h-[56vh] overflow-auto divide-y divide-white/5">
                  {loading && (
                    <div className="p-4">
                      <SkeletonBar className="h-4 w-1/2 mb-2" />
                      <SkeletonBar className="h-4 w-2/3 mb-2" />
                      <SkeletonBar className="h-4 w-1/3" />
                    </div>
                  )}

                  {!loading && visible.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-400">
                      {rowsLevel.length === 0
                        ? "No referees at this level."
                        : "No matches for your search."}
                    </div>
                  )}

                  {!loading &&
                    visible.map((r, i) => (
                      <div key={`${r.addr}-${i}`} className="grid grid-cols-12 px-3 py-2 text-xs">
                        <div className="col-span-7 font-mono text-gray-200 truncate">{r.addr}</div>
                        <div className="col-span-2 text-right text-gray-200">{r.stakes}</div>
                        <div className="col-span-3 text-right text-indigo-200">
                          {fmt(r.totalYY, decimals?.yy)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-2">
                {loading && (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-white/5 p-3">
                      <SkeletonBar className="h-4 w-2/3 mb-2" />
                      <SkeletonBar className="h-3 w-1/3" />
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <SkeletonBar className="h-4 w-1/2 mb-2" />
                      <SkeletonBar className="h-3 w-2/5" />
                    </div>
                  </div>
                )}

                {!loading && visible.length === 0 && (
                  <div className="text-[12px] text-gray-400">
                    {rowsLevel.length === 0
                      ? "No referees at this level."
                      : "No matches for your search."}
                  </div>
                )}

                {!loading &&
                  visible.map((r, i) => (
                    <div key={`${r.addr}-${i}`} className="rounded-lg bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-200 truncate">{r.addr}</span>
                        <span className="text-[11px] text-gray-400">
                          {r.stakes} stake{r.stakes === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-indigo-200">
                        Total YY {fmt(r.totalYY, decimals?.yy)}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {!loading && rowsLevel.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-1 sm:px-2 mt-3">
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Prev
                  </button>
                  <div className="text-[11px] text-gray-400">
                    Page {safePage} / {totalPages}
                  </div>
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {error && <div className="px-5 pb-5 text-xs text-rose-400">{error}</div>}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ReferralShareModal;
