// src/hooks/useResolvedReferrer.ts
import { useMemo } from "react";
import { Address, getAddress, isAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import { useQuery } from "@tanstack/react-query";
import { useReferralContext } from "@/contexts/hooks/useReferralContext";

const ZERO: Address = "0x0000000000000000000000000000000000000000";

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ??
  ZERO;

const ENV_DEFAULT_REF =
  (import.meta.env.VITE_DEFAULT_REFERRER as `0x${string}` | undefined) ?? undefined;

function normalize(addr?: string | null): Address | undefined {
  if (!addr) return undefined;
  if (!isAddress(addr)) return undefined;
  try { return getAddress(addr) as Address; } catch { return undefined; }
}

export type ReferrerStatus =
  | "onchain"      // referrer already set on-chain
  | "whitelisted"  // user is whitelisted with no referrer
  | "pending"      // from link/context, will be used on first stake
  | "default"      // fallback to VITE_DEFAULT_REFERRER
  | "none";        // cannot resolve

export type ResolvedReferrer = {
  /** What to pass to contract stake(...) right now (if any) */
  referrerForStake?: Address;
  /** What to show in the banner */
  displayReferrerLabel: string;
  displayReferrerAddr?: Address;
  /** State */
  status: ReferrerStatus;
  /** Disable stake? */
  blockReason?: string;
  /** Under the hood details */
  details: {
    onchainReferrer?: Address;
    isUserWhitelisted?: boolean;
    ctxReferrer?: Address;
    defaultReferrer?: Address;
  };
};

export function useResolvedReferrer(): ResolvedReferrer {
  const client = usePublicClient();
  const { address } = useAccount();
  const { referralData } = useReferralContext();

  const ctxRef = normalize(referralData?.referrerAddress);
  const defaultRef = normalize(ENV_DEFAULT_REF);

  // Basic reads for the viewer
  const { data: basics } = useQuery({
    enabled: !!client && !!address,
    queryKey: ["ref-basics", client?.chain?.id, address],
    queryFn: async () => {
      const [onchainReferrer, isUserWhitelisted] = (await client!.multicall({
        allowFailure: false,
        contracts: [
          { address: PROXY, abi: STAKING_ABI, functionName: "referrerOf", args: [address as Address] },
          { address: PROXY, abi: STAKING_ABI, functionName: "isWhitelisted", args: [address as Address] },
        ],
      })) as [Address, boolean];

      return { onchainReferrer, isUserWhitelisted };
    },
    staleTime: 15_000,
  });

  // Validate a candidate referrer per contract rules:
  //   - not zero, not self
  //   - (userTotalStaked[ref] > 0) OR isWhitelisted[ref] == true
  const validateReferrer = async (candidate?: Address): Promise<Address | undefined> => {
    if (!client || !candidate) return undefined;
    if (!address) return undefined;
    if (candidate.toLowerCase() === (address as Address).toLowerCase()) return undefined;
    if (candidate === ZERO) return undefined;

    try {
      const [staked, wl] = (await client.multicall({
        allowFailure: false,
        contracts: [
          { address: PROXY, abi: STAKING_ABI, functionName: "userTotalStaked", args: [candidate] },
          { address: PROXY, abi: STAKING_ABI, functionName: "isWhitelisted", args: [candidate] },
        ],
      })) as [bigint, boolean];

      if (staked > 0n || wl) return candidate;
    } catch {
      // ignore
    }
    return undefined;
  };

  return useMemo<ResolvedReferrer>(() => {
    // No wallet or basics yet — conservative placeholder
    if (!address || !basics) {
      return {
        status: "none",
        displayReferrerLabel: "—",
        details: {},
      };
    }

    const onRef = basics.onchainReferrer && basics.onchainReferrer !== ZERO
      ? basics.onchainReferrer
      : undefined;

    // 1) On-chain referrer wins
    if (onRef) {
      return {
        status: "onchain",
        referrerForStake: onRef, // safe to pass (contract ignores if same)
        displayReferrerAddr: onRef,
        displayReferrerLabel: "Referred by",
        details: { onchainReferrer: onRef, isUserWhitelisted: basics.isUserWhitelisted, ctxReferrer: ctxRef, defaultReferrer: defaultRef },
      };
    }

    // 2) User is whitelisted (no referrer)
    if (basics.isUserWhitelisted) {
      return {
        status: "whitelisted",
        displayReferrerLabel: "Whitelisted (no referrer)",
        details: { onchainReferrer: undefined, isUserWhitelisted: true, ctxReferrer: ctxRef, defaultReferrer: defaultRef },
      };
    }

    // 3) Pending (from context link) – we do not block if invalid,
    //    but we won't return it as referrerForStake until validated.
    //    We cannot validate synchronously in a memo; caller should validate on stake call.
    if (ctxRef) {
      return {
        status: "pending",
        displayReferrerLabel: "Referred by (pending)",
        displayReferrerAddr: ctxRef,
        // NOTE: no referrerForStake yet; caller will validate and pass it if valid
        details: { onchainReferrer: undefined, isUserWhitelisted: false, ctxReferrer: ctxRef, defaultReferrer: defaultRef },
      };
    }

    // 4) Default referrer path shown as “default”
    if (defaultRef) {
      return {
        status: "default",
        displayReferrerLabel: "Default referrer (will apply on first stake)",
        displayReferrerAddr: defaultRef,
        details: { onchainReferrer: undefined, isUserWhitelisted: false, ctxReferrer: undefined, defaultReferrer: defaultRef },
      };
    }

    // 5) none
    return {
      status: "none",
      displayReferrerLabel: "—",
      blockReason: "No referrer available. Provide a referral link or ask admin to configure a default referrer.",
      details: { onchainReferrer: undefined, isUserWhitelisted: false, ctxReferrer: undefined, defaultReferrer: undefined },
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, basics?.onchainReferrer, basics?.isUserWhitelisted, ctxRef, defaultRef]) as ResolvedReferrer;
}
