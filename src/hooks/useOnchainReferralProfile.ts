// src/hooks/useOnchainReferralProfile.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { gql, subgraph } from "@/lib/subgraph";

/** ===== Formatting helper (kept same export name/signature) ===== */
export function fmt(v: bigint, decimals = 18): string {
  try {
    if (decimals <= 0) return v.toString();
    const s = v.toString().padStart(decimals + 1, "0");
    const i = s.length - decimals;
    const whole = s.slice(0, i) || "0";
    const frac = s.slice(i).replace(/0+$/, "");
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return frac ? `${withCommas}.${frac}` : withCommas;
  } catch {
    return v.toString();
  }
}

/* ===================== Queries ===================== */

const Q_USER = gql/* GraphQL */ `
  query UserTotal($id: ID!) {
    user(id: $id) { id totalStaked }
  }
`;

/** Get referrals for a set of referrers. We’ll paginate client-side. */
const Q_REFS = gql/* GraphQL */ `
  query Refs($referrers: [String!], $first: Int!, $skip: Int!) {
    referrals(where: { referrer_in: $referrers }, first: $first, skip: $skip, orderBy: id, orderDirection: asc) {
      referrer { id }
      referee  { id totalStaked }
    }
  }
`;

/** Pull all stakes for a set of users just to count them client-side. */
const Q_STAKES = gql/* GraphQL */ `
  query StakesCounts($users: [String!], $first: Int!, $skip: Int!) {
    stakes(where: { user_in: $users }, first: $first, skip: $skip) {
      user { id }
      id
    }
  }
`;

/* ===================== Helpers ===================== */

type RefRow = { addr: string; stakes: number; totalYY: bigint };
type Lvl = { level: number; rows: RefRow[]; totalYY: bigint };

const FIRST = 1000;
const MAX_LEVEL = 15;

/** chunk an array (helps with _in filters and pagination) */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchAllRefsFor(referrersLC: string[]): Promise<{ referrer: string; referee: { id: string; totalStaked: string } }[]> {
  if (!referrersLC.length) return [];
  const out: { referrer: string; referee: { id: string; totalStaked: string } }[] = [];

  // break big inputs into chunks for the _in filter
  for (const group of chunk(referrersLC, 800)) {
    let skip = 0;
    // paginate through referrals
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await subgraph.request<{
        referrals: Array<{
          referrer: { id: string };
          referee:  { id: string; totalStaked: string };
        }>;
      }>(Q_REFS, { referrers: group, first: FIRST, skip });

      const items = res?.referrals ?? [];
      if (!items.length) break;
      for (const it of items) {
        out.push({ referrer: it.referrer.id, referee: { id: it.referee.id, totalStaked: it.referee.totalStaked } });
      }
      if (items.length < FIRST) break;
      skip += FIRST;
    }
  }
  return out;
}

async function fetchStakeCountsFor(usersLC: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!usersLC.length) return counts;

  for (const group of chunk(usersLC, 800)) {
    let skip = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await subgraph.request<{
        stakes: Array<{ user: { id: string } }>;
      }>(Q_STAKES, { users: group, first: FIRST, skip });

      const items = res?.stakes ?? [];
      if (!items.length) break;
      for (const it of items) {
        const id = it.user.id;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      if (items.length < FIRST) break;
      skip += FIRST;
    }
  }
  return counts;
}

async function fetchUserTotalYY(userIdLC: string): Promise<bigint> {
  if (!userIdLC) return 0n;
  try {
    const res = await subgraph.request<{ user: { id: string; totalStaked: string } | null }>(Q_USER, { id: userIdLC });
    return res?.user?.totalStaked ? BigInt(res.user.totalStaked) : 0n;
  } catch {
    return 0n;
  }
}

/* ===================== Hook (subgraph-only) ===================== */

export function useOnchainReferralProfile(address?: `0x${string}`) {
  const userId = (address ?? "").toLowerCase();

  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  // First-level rows (kept for back-compat); full levels[] below
  const [refRows, setRefRows] = useState<RefRow[]>([]);
  const [levels, setLevels] = useState<Lvl[]>([]);
  const [myTotalYY, setMyTotalYY] = useState<bigint>(0n);

  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError(null);
      setRefRows([]);
      setLevels([]);
      setMyTotalYY(0n);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) My total from subgraph
        const myTotal = await fetchUserTotalYY(userId);
        if (!aliveRef.current) return;
        setMyTotalYY(myTotal);

        // 2) BFS-ish up to 15 levels
        const resultLevels: Lvl[] = [];
        let frontier = [userId];
        const seen = new Set<string>([userId]);

        for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
          // get referrals whose referrer is in `frontier`
          const refs = await fetchAllRefsFor(frontier);
          if (!aliveRef.current) return;

          if (!refs.length) break;

          // referees of this level (dedupe)
          const referees = Array.from(
            new Set(refs.map((r) => r.referee.id.toLowerCase()).filter((id) => !seen.has(id)))
          );

          // mark seen & prepare next frontier
          referees.forEach((id) => seen.add(id));
          frontier = referees.length ? referees : [];

          // count stakes of this level (client-side aggregate)
          const stakeCounts = await fetchStakeCountsFor(referees);
          if (!aliveRef.current) return;

          // rows for this level
          const lvlRows: RefRow[] = referees.map((addr) => {
            const totalYY = refs.find((r) => r.referee.id.toLowerCase() === addr)?.referee.totalStaked ?? "0";
            return {
              addr,
              stakes: stakeCounts.get(addr) ?? 0,
              totalYY: BigInt(totalYY || "0"),
            };
          });

          // sum for level
          const levelSum = lvlRows.reduce<bigint>((acc, r) => acc + (r.totalYY ?? 0n), 0n);

          resultLevels.push({ level: lvl, rows: lvlRows, totalYY: levelSum });
        }

        if (!aliveRef.current) return;

        setLevels(resultLevels);
        // Keep refRows (first level) populated for existing consumers
        setRefRows(resultLevels[0]?.rows ?? []);
      } catch (e: any) {
        if (!aliveRef.current) return;
        setError(e?.message || "Failed to load referral profile");
        setLevels([]);
        setRefRows([]);
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();
  }, [userId]);

  // Decimals (no onchain calls; subgraph doesn’t store decimals; default 18)
  const decimals = useMemo(() => ({ yy: 18 }), []);

  return {
    loading,
    error,
    refRows,
    decimals,
    myTotalYY,
    levels,
  };
}
