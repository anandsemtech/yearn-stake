// src/hooks/useStakeWithReferrer.ts
import { useCallback, useState } from "react";
import { Address, isAddress, getAddress } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import { useResolvedReferrer } from "./useResolvedReferrer";

const ZERO: Address = "0x0000000000000000000000000000000000000000";

const PROXY =
  (import.meta.env.VITE_BASE_CONTRACT_ADDRESS as `0x${string}`) ??
  ZERO;

export function useStakeWithReferrer() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: wallet } = useWalletClient();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const resolved = useResolvedReferrer();

  // validator identical to the one used inside useResolvedReferrer (but runtime-safe)
  const validateReferrer = useCallback(
    async (candidate?: Address) => {
      if (!publicClient || !candidate || !address) return undefined;
      if (!isAddress(candidate)) return undefined;
      const who = getAddress(candidate);

      if (who.toLowerCase() === (address as Address).toLowerCase()) return undefined;
      if (who === ZERO) return undefined;

      try {
        const [staked, wl] = (await publicClient.multicall({
          allowFailure: false,
          contracts: [
            { address: PROXY, abi: STAKING_ABI, functionName: "userTotalStaked", args: [who] },
            { address: PROXY, abi: STAKING_ABI, functionName: "isWhitelisted", args: [who] },
          ],
        })) as [bigint, boolean];

        if (staked > 0n || wl) return who as Address;
      } catch {
        // ignore
      }
      return undefined;
    },
    [publicClient, address]
  );

  const stake = useCallback(
    async ({
      packageId,
      tokens,
      amounts,
    }: {
      packageId: number;
      tokens: Address[];
      amounts: bigint[];
    }) => {
      if (!wallet || !publicClient) throw new Error("Wallet not ready");

      setSending(true);
      setError(undefined);

      // 1) If on-chain referrer exists, use it as-is (contract enforces immutability)
      let refToUse: Address | undefined = resolved.details?.onchainReferrer;

      // 2) else, try pending ctx referrer (validate)
      if (!refToUse && resolved.details?.ctxReferrer) {
        refToUse = await validateReferrer(resolved.details.ctxReferrer);
      }

      // 3) else, try default referrer (validate)
      if (!refToUse && resolved.details?.defaultReferrer) {
        refToUse = await validateReferrer(resolved.details.defaultReferrer);
      }

      // 4) If still none, block with clear reason
      if (!refToUse) {
        setSending(false);
        setError(
          "No valid referrer available. Use a referral link, or ask the admin to whitelist the default referrer."
        );
        throw new Error("NO_VALID_REFERRER");
      }

      // send tx
      try {
        const hash = await wallet.writeContract({
          address: PROXY,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [packageId, tokens, amounts, refToUse],
        });

        // wait for mining (optional but nice)
        await publicClient.waitForTransactionReceipt({ hash });

        setSending(false);
        return hash;
      } catch (e: any) {
        setSending(false);
        setError(e?.shortMessage || e?.message || "Failed to stake");
        throw e;
      }
    },
    [wallet, publicClient, resolved.details, validateReferrer]
  );

  return { stake, sending, error, resolvedReferrer: resolved };
}
