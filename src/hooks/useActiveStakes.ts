import { useEffect, useRef, useState, useCallback } from "react";
import { formatEther } from "viem";
import { gql } from "graphql-request";
import { subgraph } from "@/lib/subgraph";
import type { ActivePackageRow } from "@/components/ActivePackages";

/* ---------------- Local cache ---------------- */
type CacheValue = { t: number; data: any };
const MEM = new Map<string, CacheValue>();
const TTL_MS_DEFAULT = 60_000;

function readCache(key: string, ttlMs = TTL_MS_DEFAULT) {
  const now = Date.now();
  const m = MEM.get(key);
  if (m && now - m.t < ttlMs) return m.data;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const v: CacheValue = JSON.parse(raw);
    if (now - v.t < ttlMs) {
      MEM.set(key, v);
      return v.data;
    }
  } catch {}
  return null;
}
function writeCache(key: string, data: any) {
  const entry: CacheValue = { t: Date.now(), data };
  MEM.set(key, entry);
  try { localStorage.setItem(key, JSON.stringify(entry)); } catch {}
}

/* ---------------- GraphQL (single call) ---------------- */
const Q_ACTIVE_VIEW = gql/* GraphQL */ `
  query ActiveView($id: ID!) {
    packages(orderBy: packageId, orderDirection: asc) {
      packageId
      durationInDays
      aprBps
      monthlyUnstake
      isActive
      monthlyAPRClaimable
      claimableInterval
      principalLocked
    }
    stakes(where:{ user: $id }, orderBy: startTime, orderDirection: desc) {
      id
      packageId
      totalStaked
      claimedAPR
      withdrawnPrincipal
      startTime
      lastClaimedAt
      lastUnstakedAt
      isFullyUnstaked
    }
  }
`;

type RawPkg = {
  packageId: number | string;
  durationInDays: number | string;
  aprBps: number | string;
  monthlyUnstake: boolean;
  isActive: boolean;
  monthlyAPRClaimable: boolean;
  claimableInterval: string; // BigInt
  principalLocked: boolean;
};
type RawStake = {
  id: string;
  packageId: number | string;
  totalStaked: string;
  claimedAPR: string;
  withdrawnPrincipal: string;
  startTime: string;
  lastClaimedAt: string;
  lastUnstakedAt: string;
  isFullyUnstaked: boolean;
};

export function useActiveStakes(opts: { address?: `0x${string}` | null; ttlMs?: number }) {
  const { address, ttlMs = TTL_MS_DEFAULT } = opts;
  const userId = (address ?? "").toLowerCase();

  const [rows, setRows] = useState<ActivePackageRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const buildRows = useCallback((pkgs: RawPkg[], stakes: RawStake[]): ActivePackageRow[] => {
    const pkgMap = new Map<number, {
      durationInDays: number;
      aprBps: number;
      monthlyUnstake: boolean;
      isActive: boolean;
      monthlyAPRClaimable: boolean;
      claimableIntervalSec: number;
      principalLocked: boolean;
    }>();
    for (const p of pkgs) {
      const idNum = typeof p.packageId === "string" ? Number(p.packageId) : p.packageId;
      pkgMap.set(idNum, {
        durationInDays: Number(p.durationInDays || 0),
        aprBps: Number(p.aprBps || 0),
        monthlyUnstake: Boolean(p.monthlyUnstake),
        isActive: Boolean(p.isActive),
        monthlyAPRClaimable: Boolean(p.monthlyAPRClaimable),
        claimableIntervalSec: Number(p.claimableInterval || 0),
        principalLocked: Boolean(p.principalLocked),
      });
    }

    return stakes.map((s) => {
      const pkgId = typeof s.packageId === "string" ? Number(s.packageId) : s.packageId;
      const pkg = pkgMap.get(pkgId);

      const stakeIndexStr = (s.id.split("-").pop() || "0");
      const startSec      = Number(s.startTime || 0);
      const lastClaimSec  = Number(s.lastClaimedAt || 0);

      const nextClaimAt =
        pkg?.monthlyAPRClaimable && pkg.claimableIntervalSec
          ? (lastClaimSec > 0 ? lastClaimSec + pkg.claimableIntervalSec
                              : startSec > 0 ? startSec + pkg.claimableIntervalSec : 0)
          : 0;

      const totalStakedWei        = BigInt(s.totalStaked || "0");
      const claimedAprWei         = BigInt(s.claimedAPR || "0");
      const principalWithdrawnWei = BigInt(s.withdrawnPrincipal || "0");

      let amountHuman = "0";
      try { amountHuman = Number(formatEther(totalStakedWei)).toLocaleString(); } catch {}

      const packageActive = Boolean(pkg?.isActive);
      const fullyUnstaked = Boolean(s.isFullyUnstaked) || principalWithdrawnWei >= totalStakedWei;

      return {
        id: s.id,
        packageName: `Package #${pkgId}`,
        amount: amountHuman,
        startDate: startSec ? new Date(startSec * 1000) : new Date(0),
        nextClaimWindow: nextClaimAt ? new Date(nextClaimAt * 1000) : undefined,
        status: packageActive ? "Active" : "Inactive",
        stakeIndex: stakeIndexStr,
        packageId: pkgId,
        aprPct: pkg ? pkg.aprBps / 100 : undefined,

        isFullyUnstaked: fullyUnstaked,
        totalStakedWei,
        claimedAprWei,
        aprBps: pkg?.aprBps,
        startTs: startSec || undefined,
        nextClaimAt: nextClaimAt || undefined,
        principalWithdrawnWei,

        pkgRules: pkg ? {
          durationInDays: pkg.durationInDays,
          aprBps: pkg.aprBps,
          monthlyUnstake: pkg.monthlyUnstake,
          isActive: pkg.isActive,
          monthlyAPRClaimable: pkg.monthlyAPRClaimable,
          claimableIntervalSec: pkg.claimableIntervalSec,
          principalLocked: pkg.principalLocked,
        } : undefined,
      } as ActivePackageRow;
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) { setRows([]); setLoading(false); setError(null); return; }
    setLoading(true); setError(null);

    const CK = `activeview:v3:${userId}`;
    const cached = readCache(CK, ttlMs);
    if (cached) {
      setRows(buildRows(cached.packages as RawPkg[], cached.stakes as RawStake[]));
      setLoading(false);
      return;
    }
    try {
      const data = await subgraph.request<any>(Q_ACTIVE_VIEW, { id: userId });
      if (abortRef.current) return;
      const payload = { packages: (data?.packages||[]) as RawPkg[], stakes: (data?.stakes||[]) as RawStake[] };
      writeCache(CK, payload);
      setRows(buildRows(payload.packages, payload.stakes));
    } catch (e: any) {
      if (!abortRef.current) setError(e?.message || "Failed to load");
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [userId, ttlMs, buildRows]);

  useEffect(() => { abortRef.current = false; refresh(); return () => { abortRef.current = true; }; }, [refresh]);

  // 🔔 Refresh on any stake/claim/unstake related event (and clear caches)
  useEffect(() => {
    let timer: number | null = null;

    const invalidate: EventListener = () => {
      // coalesce multiple events within 250ms into one refresh
      if (timer != null) return;
      timer = window.setTimeout(() => {
        timer = null;
        const CK = `activeview:v3:${userId}`;
        MEM.delete(CK);
        try { localStorage.removeItem(CK); } catch {}
        refresh();
      }, 250);
    };

    const names = [
      "staking:updated",
      "active-packages:refresh",
      "stakes:changed",
      "apr:claimed",
      "unstaked",
      "staked",
    ];

    names.forEach((n) => window.addEventListener(n, invalidate));
    return () => {
      if (timer != null) { clearTimeout(timer); timer = null; }
      names.forEach((n) => window.removeEventListener(n, invalidate));
    };
  }, [refresh, userId]);


  return { rows, loading, error, refresh };
}
