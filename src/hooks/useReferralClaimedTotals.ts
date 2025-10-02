import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";

const REFERRAL_REWARDS_CLAIMED_EVENT = {
  type: "event",
  name: "ReferralRewardsClaimed",
  inputs: [
    { indexed: false, name: "user",    type: "address" },
    { indexed: false, name: "yAmount", type: "uint256" },
    { indexed: false, name: "sAmount", type: "uint256" },
    { indexed: false, name: "pAmount", type: "uint256" },
  ],
} as const;

type Totals = { y: bigint; s: bigint; p: bigint };

export function useReferralClaimedTotals(params: {
  proxy: Address | undefined;
  user: Address | undefined;
  /** inclusive block where the proxy was deployed (prevents missing older logs) */
  deployBlock?: bigint; // e.g. 31700000n
}) {
  const { proxy, user, deployBlock } = params;
  const publicClient = usePublicClient();

  const [totals, setTotals] = useState<Totals>({ y: 0n, s: 0n, p: 0n });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canRun = Boolean(publicClient && proxy && user);

  useEffect(() => {
    let alive = true;
    if (!canRun) {
      setTotals({ y: 0n, s: 0n, p: 0n });
      setLoading(false);
      setErr(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // choose a safe fromBlock
        let fromBlock = 0n;
        try {
          if (typeof deployBlock === "bigint" && deployBlock > 0n) {
            fromBlock = deployBlock;
          } else {
            // as a fallback, scan recent window
            const tip = await publicClient!.getBlockNumber();
            fromBlock = tip > 120000n ? tip - 120000n : 0n;
          }
        } catch {
          // noop
        }

        const logs = await publicClient!.getLogs({
          address: proxy!,
          // IMPORTANT: do NOT filter by args here; user is not indexed
          event: REFERRAL_REWARDS_CLAIMED_EVENT,
          fromBlock,
          toBlock: "latest",
        });

        let y = 0n, s = 0n, p = 0n;
        const uLower = (user as string).toLowerCase();

        for (const log of logs) {
          const args = (log as any).args;
          let userAddr: string | undefined;
          let yAmount: bigint | undefined;
          let sAmount: bigint | undefined;
          let pAmount: bigint | undefined;

          if (args && "user" in args) {
            userAddr = (args.user as string | undefined)?.toLowerCase();
            yAmount = args.yAmount as bigint | undefined;
            sAmount = args.sAmount as bigint | undefined;
            pAmount = args.pAmount as bigint | undefined;
          } else {
            // provider didn’t pre-decode — do it ourselves
            try {
              const dec = decodeEventLog({
                abi: [REFERRAL_REWARDS_CLAIMED_EVENT],
                data: log.data,
                topics: log.topics,
              });
              const a = dec.args as any;
              userAddr = (a?.user as string | undefined)?.toLowerCase();
              yAmount = a?.yAmount as bigint | undefined;
              sAmount = a?.sAmount as bigint | undefined;
              pAmount = a?.pAmount as bigint | undefined;
            } catch {
              continue;
            }
          }

          if (!userAddr || userAddr !== uLower) continue;
          y += yAmount ?? 0n;
          s += sAmount ?? 0n;
          p += pAmount ?? 0n;
        }

        if (!alive) return;
        setTotals({ y, s, p });
        setLoading(false);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to read claim events");
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [publicClient, proxy, user, deployBlock, canRun]);

  // live updates after new claims
  useEffect(() => {
    if (!publicClient || !proxy || !user) return;

    const unwatch = publicClient.watchEvent({
      address: proxy,
      event: REFERRAL_REWARDS_CLAIMED_EVENT,
      onLogs: (logs) => {
        let addY = 0n, addS = 0n, addP = 0n;
        const uLower = (user as string).toLowerCase();

        for (const log of logs) {
          const a = (log as any).args;
          if (!a?.user) continue;
          if ((a.user as string).toLowerCase() !== uLower) continue;
          addY += (a.yAmount as bigint) ?? 0n;
          addS += (a.sAmount as bigint) ?? 0n;
          addP += (a.pAmount as bigint) ?? 0n;
        }

        if (addY || addS || addP) {
          setTotals((prev) => ({
            y: prev.y + addY,
            s: prev.s + addS,
            p: prev.p + addP,
          }));
        }
      },
      poll: true, // helpful on some testnet RPCs
    });

    return () => { try { unwatch?.(); } catch {} };
  }, [publicClient, proxy, user]);

  return {
    loading,
    error: err,
    totals,                // { y, s, p } in wei
    totalsArray: [totals.y, totals.s, totals.p] as const,
    isReady: canRun,
  };
}
