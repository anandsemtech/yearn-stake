// src/hooks/useEarningsSG.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { subgraph } from "@/lib/subgraph";

// Point to your latest SG URL via env or subgraph.ts default
// This hook does **no polling**. Only manual refresh and short post-claim polling.

type RawEarning = { token: string; amount: string; timestamp: string };
type RawClaim = { yAmount: string; sAmount: string; pAmount: string; timestamp: string };

const Q_LAST = /* GraphQL */ `
  query LastReferralClaim($userBytes: Bytes!) {
    last: referralRewardsClaims(
      where: { user: $userBytes }
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) { timestamp }
  }
`;

const Q_CLAIMS_ALL = /* GraphQL */ `
  query ClaimsAll($userBytes: Bytes!) {
    claims: referralRewardsClaims(
      where: { user: $userBytes }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) { yAmount sAmount pAmount timestamp }
  }
`;

const Q_EARNINGS_SINCE = /* GraphQL */ `
  query EarningsSince($user: String!, $since: BigInt!) {
    earnings: referralEarnings(
      where: { user: $user, timestamp_gt: $since }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) { token amount timestamp }
  }
`;

// Cooldown between manual fetches (prevents 429)
const COOLDOWN_MS = 6000;

// Short, bounded backoff sequence after a successful claim.
// (Stops early if available goes to zero.)
const POST_CLAIM_STEPS_MS = [2500, 4000, 6000, 9000];

const toLower = (s?: string | null) => (s ? s.toLowerCase() : s);

// Read token addresses from ENV (no on-chain reads here)
const Y_ENV = toLower(import.meta.env.VITE_YYEARN_ADDRESS);
const S_ENV = toLower(import.meta.env.VITE_SYEARN_ADDRESS);
const P_ENV = toLower(import.meta.env.VITE_PYEARN_ADDRESS);

function sumBig(a: bigint, b: string | bigint) {
  if (typeof b === "bigint") return a + b;
  return a + BigInt(b || "0");
}

export function useEarningsSG(user?: Address | string) {
  const userHex = toLower(user ?? "") || null;
  const userBytes = userHex as string | null;

  const [loading, setLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const [version, setVersion] = useState(0); // for debug if needed

  const inFlight = useRef(false);
  const abortRef = useRef(0);

  const [lifeSum, setLifeSum] = useState<bigint>(0n);
  const [availY, setAvailY] = useState<bigint>(0n);
  const [availS, setAvailS] = useState<bigint>(0n);
  const [availP, setAvailP] = useState<bigint>(0n);

  const availSum = useMemo(() => availY + availS + availP, [availY, availS, availP]);

  const coolingDown = useMemo(() => {
    const dt = Date.now() - lastFetchedAt;
    return dt < COOLDOWN_MS;
  }, [lastFetchedAt]);

  const fetchOnce = useCallback(
    async (force = false) => {
      if (!userHex || !userBytes) return;
      if (inFlight.current) return;

      // Cooldown guard to avoid spamming SG
      if (!force) {
        const dt = Date.now() - lastFetchedAt;
        if (dt < COOLDOWN_MS) return;
      }

      inFlight.current = true;
      setLoading(true);
      const localMarker = ++abortRef.current;

      try {
        // 1) Find last claim timestamp
        const lastRes = await subgraph.request<{ last: { timestamp: string }[] }>(Q_LAST, {
          userBytes,
        });
        const since =
          lastRes?.last?.[0]?.timestamp ? BigInt(lastRes.last[0].timestamp) : 0n;

        // 2) Sum all lifetime claimed
        const claimsRes = await subgraph.request<{ claims: RawClaim[] }>(Q_CLAIMS_ALL, {
          userBytes,
        });
        let lifeY = 0n,
          lifeS = 0n,
          lifeP = 0n;
        for (const c of claimsRes.claims || []) {
          lifeY = sumBig(lifeY, c.yAmount);
          lifeS = sumBig(lifeS, c.sAmount);
          lifeP = sumBig(lifeP, c.pAmount);
        }
        const lifeTotal = lifeY + lifeS + lifeP;

        // 3) Earnings since last claim, grouped by token
        const earnRes = await subgraph.request<{ earnings: RawEarning[] }>(Q_EARNINGS_SINCE, {
          user: userHex,
          since: since.toString(),
        });

        // Map sums by token
        const perToken = new Map<string, bigint>();
        for (const e of earnRes.earnings || []) {
          const key = toLower(e.token)!;
          perToken.set(key, sumBig(perToken.get(key) ?? 0n, e.amount));
        }

        // Assign chips using ENV tokens
        const yVal = perToken.get(Y_ENV || "") ?? 0n;
        const sVal = perToken.get(S_ENV || "") ?? 0n;
        const pVal = perToken.get(P_ENV || "") ?? 0n;

        // If aborted (newer fetch kicked in), drop this result
        if (abortRef.current !== localMarker) return;

        setLifeSum(lifeTotal);
        setAvailY(yVal);
        setAvailS(sVal);
        setAvailP(pVal);
        setLastFetchedAt(Date.now());
        setVersion((v) => v + 1);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [userHex, userBytes, lastFetchedAt]
  );

  // Public API
  const refetch = useCallback(() => fetchOnce(true), [fetchOnce]);

  // After successful on-chain claim, lightly poll with backoff, stop early if avail==0
  const refetchAfterMutation = useCallback(async () => {
    for (const delay of POST_CLAIM_STEPS_MS) {
      await new Promise((r) => setTimeout(r, delay));
      await fetchOnce(true);
      if (availSum === 0n) break;
    }
  }, [fetchOnce, availSum]);

  // First mount: do not auto-poll; just one initial fetch
  useEffect(() => {
    void fetchOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHex]);

  return {
    loading,
    totals: {
      lifeSum, // lifetime claimed total (wei)
      availY,
      availS,
      availP,
      availSum,
    },
    refetch,               // manual refresh (debounced via cooldown)
    refetchAfterMutation,  // short post-claim polling
    lastFetchedAt,
    coolingDown,
    version,
  };
}
