// src/contexts/WalletContext.tsx
import React, { createContext, useEffect, useRef, useState, useContext, useMemo } from "react";
import { Address, formatEther } from "viem";
import { useAccount, useAccountEffect } from "wagmi";

import { useReferralInfo } from "../graphql/hooks/useReferralInfo";
import { PackageList, useUserStakes } from "../graphql/hooks/useUserStakes";

import { useTokenAddresses } from "@/web3/hooks/useTokenAddresses";
import { useTokenDetails } from "@/web3/hooks/useTokenDetails";

import {
  useClaimableInterval,
  useClaimableStarLevelRewards,
  useGoldenStarConfig,
  useIsGoldenStar,
  useNextPackageId,
  usePendingGoldenStarRewards,
  useReferralEarnings,
  useUserStarLevel,
} from "@/web3/hooks/contractReadAliases";

export interface ActivePackage {
  id: string;
  name: string;
  duration: number;
  amount: number;
  apy: number;
  startDate: Date;
  endDate: Date;
  status: string;
  stakeIndex: string;
}

interface User {
  address: string;
  email: string;
  phone: string;
  starLevel: number;
  totalEarnings: number;
  totalVolume: number;
  totalReferrals: number;
  directReferrals: number;
  levelUsers: { [key: number]: number };
  isGoldenStar: boolean;
  goldenStarProgress: number;
  activePackages: ActivePackage[];
}

interface TokenDetails {
  balance: number;
  allowance: number;
  isLoading: boolean;
  error: Error | null;
}

interface TokenAddresses {
  yYearnAddress: Address;
  sYearnAddress: Address;
  pYearnAddress: Address;
  isLoading: boolean;
  error: Error | null;
}

interface GoldenStarConfig {
  minReferral: number;
  timeWindow: number;
  rewardPercent: number;
  rewardDuration: number;
  rewardCapMultiplier: number;
}

interface WalletContextType {
  isConnected: boolean;
  user: User | null;
  totalReferralEarnings: number;
  currentStarLevelEarnings: number;
  pendingGoldenStarRewards: number;
  tokenDetails: TokenDetails;
  tokenAddresses: TokenAddresses;
  goldenStarConfig: GoldenStarConfig | null;
  nextPackageId: number | null;
  isUserStakesLoading: boolean;
  userStakes: PackageList[];
  updateUserProfile: (email: string, phone: string) => void;
  refreshUserStakes?: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const { isConnected: isConnectedWagmi, address } = useAccount();

  const { detail, isLoading: isTokenDetailLoading, error, refetch: refetchTokenDetails } = useTokenDetails();
  const {
    yYearnAddress,
    sYearnAddress,
    pYearnAddress,
    isLoading: isTokenAddressesLoading,
    error: tokenAddressesError,
  } = useTokenAddresses();

  const {
    level1, level2, level3, level4, level5,
    isLevel1Loading, isLevel2Loading, isLevel3Loading, isLevel4Loading, isLevel5Loading,
  } = useReferralInfo();

  const { data: userStarLevel } = useUserStarLevel(address as Address);
  const { data: isUserGoldenStar } = useIsGoldenStar(address as Address);
  const { data: goldenStarConfig } = useGoldenStarConfig();
  const { data: nextPackageId } = useNextPackageId();

  // Filter for connected wallet only
  const {
    packageList: userStakes,
    isLoading: isUserStakesLoading,
    refetch: refetchUserStakes,
  } = useUserStakes(address as Address);

  const { data: yReferralEarnings } = useReferralEarnings(address as Address, yYearnAddress as Address);
  const { data: sReferralEarnings } = useReferralEarnings(address as Address, sYearnAddress as Address);
  const { data: pReferralEarnings } = useReferralEarnings(address as Address, pYearnAddress as Address);

  const { data: claimableStarLevelRewards } = useClaimableStarLevelRewards(address as Address);
  const { data: pendingGoldenStarRewards } = usePendingGoldenStarRewards(address as Address);
  const { data: claimableInterval } = useClaimableInterval();

  /** ========== STABLE POLLER (runs once) ========== */
  const refetchTokenDetailsRef = useRef(refetchTokenDetails);
  useEffect(() => { refetchTokenDetailsRef.current = refetchTokenDetails; }, [refetchTokenDetails]);

  const refetchUserStakesRef = useRef(refetchUserStakes);
  useEffect(() => { refetchUserStakesRef.current = refetchUserStakes; }, [refetchUserStakes]);

  const pollerStarted = useRef(false);
  useEffect(() => {
    if (pollerStarted.current) return;
    pollerStarted.current = true;

    const id = setInterval(() => {
      try { refetchTokenDetailsRef.current?.(); } catch {}
      try { refetchUserStakesRef.current?.(); } catch {}
    }, 10000);
    return () => clearInterval(id);
  }, []);

  /** Reset user on disconnect */
  useAccountEffect({
    onConnect: () => {},
    onDisconnect: () => setUser(null),
  });

  /** ========== Map subgraph stakes -> activePackages (pure + guarded) ========== */
  const mappedActive: ActivePackage[] = useMemo(() => {
    if (!address || !userStakes || userStakes.length === 0) return [];
    const lower = String(address).toLowerCase();
    const intervalMs = Number(claimableInterval ?? 0) * 1000;

    return (userStakes as any[]).filter((s) => {
      const owner = s.user?.id ?? s.user ?? s.account ?? s.wallet ?? s.address;
      return owner && String(owner).toLowerCase() === lower;
    }).map((s) => {
      const pkgId = Number(s.packageId ?? 0);
      const stWei = BigInt(String(s.totalStaked ?? "0"));
      const startedMs = Number(s.timestamp ?? 0) * 1000 || Date.now();
      const endMs = intervalMs ? startedMs + intervalMs : startedMs;
      const indexStr = String(s.id ?? "").includes("-")
        ? String(s.id).split("-").pop()!
        : String(pkgId);

      return {
        id: String(s.id ?? `${address}-${pkgId}`),
        name: String(pkgId),
        duration: 0,
        amount: Number(formatEther(stWei)),
        apy: 0,
        startDate: new Date(startedMs),
        endDate: new Date(endMs),
        status: "active",
        stakeIndex: indexStr,
      };
    });
  }, [address, userStakes, claimableInterval]);

  /** ========== Apply “activePackages” only if changed ========== */
  useEffect(() => {
    setUser((prev) => {
      if (!address) return null;
      const base: User = prev ?? {
        address,
        email: "",
        phone: "",
        starLevel: 0,
        totalEarnings: 12500.75,
        totalVolume: 45000,
        totalReferrals: 28,
        directReferrals: 0,
        levelUsers: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        isGoldenStar: false,
        goldenStarProgress: (3 / 15) * 100,
        activePackages: [],
      };

      // shallow compare active list
      const a = base.activePackages, b = mappedActive;
      const same =
        a.length === b.length &&
        a.every((x, i) => {
          const y = b[i];
          return x.id === y.id &&
                 x.name === y.name &&
                 x.amount === y.amount &&
                 x.startDate.getTime() === y.startDate.getTime() &&
                 x.endDate.getTime() === y.endDate.getTime() &&
                 x.stakeIndex === y.stakeIndex;
        });

      if (same) return base;
      return { ...base, activePackages: mappedActive };
    });
  }, [address, mappedActive]);

  /** ========== Patch star/golden fields without re-looping ========== */
  useEffect(() => {
    if (!address) return;
    setUser((prev) => {
      if (!prev) return prev;
      const nextStar = Number(userStarLevel ?? 0);
      const nextGS = Boolean(isUserGoldenStar);
      if (prev.starLevel === nextStar && prev.isGoldenStar === nextGS) return prev;
      return { ...prev, starLevel: nextStar, isGoldenStar: nextGS };
    });
  }, [address, userStarLevel, isUserGoldenStar]);

  /** ========== Patch referral level counts ========== */
  useEffect(() => {
    if (isLevel1Loading || isLevel2Loading || isLevel3Loading || isLevel4Loading || isLevel5Loading) return;
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        directReferrals: level1?.count || 0,
        levelUsers: {
          1: level1?.count || 0,
          2: level2?.count || 0,
          3: level3?.count || 0,
          4: level4?.count || 0,
          5: level5?.count || 0,
        },
      };
      const same =
        prev.directReferrals === next.directReferrals &&
        [1,2,3,4,5].every((k) => prev.levelUsers[k] === (next.levelUsers as any)[k]);
      if (same) return prev;
      return { ...prev, ...next };
    });
  }, [isLevel1Loading, isLevel2Loading, isLevel3Loading, isLevel4Loading, isLevel5Loading, level1, level2, level3, level4, level5]);

  const totalReferralEarnings =
    Number(yReferralEarnings ? formatEther(yReferralEarnings as unknown as bigint) : 0) +
    Number(sReferralEarnings ? formatEther(sReferralEarnings as unknown as bigint) : 0) +
    Number(pReferralEarnings ? formatEther(pReferralEarnings as unknown as bigint) : 0);

  const ctxValue: WalletContextType = {
    isConnected: isConnectedWagmi,
    user,
    totalReferralEarnings,
    currentStarLevelEarnings: Number(
      claimableStarLevelRewards ? formatEther(claimableStarLevelRewards as unknown as bigint) : 0
    ),
    pendingGoldenStarRewards: Number(
      pendingGoldenStarRewards ? formatEther(pendingGoldenStarRewards as unknown as bigint) : 0
    ),
    tokenDetails: {
      balance: Number(detail?.balance ?? 0),
      allowance: Number(detail?.allowance ?? 0),
      error,
      isLoading: isTokenDetailLoading,
    },
    tokenAddresses: {
      yYearnAddress,
      sYearnAddress,
      pYearnAddress,
      isLoading: isTokenAddressesLoading,
      error: tokenAddressesError,
    },
    goldenStarConfig,
    nextPackageId: (nextPackageId as number) ?? null,
    isUserStakesLoading,
    userStakes: userStakes ?? [],
    updateUserProfile: (email: string, phone: string) => {
      setUser((prev) => (prev ? { ...prev, email, phone } : prev));
    },
    refreshUserStakes: () => refetchUserStakes?.(),
  };

  return <WalletContext.Provider value={ctxValue}>{children}</WalletContext.Provider>;
};
