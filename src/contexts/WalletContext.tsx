import React, { createContext, useState, useEffect } from "react";
import { Address, formatEther } from "viem";
import { useAccount, useAccountEffect } from "wagmi";

import { PackageList, useUserStakes } from "../graphql/hooks/useUserStakes";
import { useTokenDetails } from "../web3/ReadContract/useTokenDetails";
import {
  useClaimableInterval,
  useClaimableStarLevelRewards,
  useGoldenStarConfig,
  useIsGoldenStar,
  useNextPackageId,
  usePendingGoldenStarRewards,
  useReferralEarnings,
  useTokenAddresses,
  useUserStarLevel,
} from "../web3/ReadContract/useYearnTogetherHooks";

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
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { isConnected: isConnectedWagmi, address } = useAccount();
  const {
    detail,
    isLoading: isTokenDetailLoading,
    error,
    refetch: refetchTokenDetails,
  } = useTokenDetails();

  const {
    yYearnAddress,
    sYearnAddress,
    pYearnAddress,
    isLoading: isTokenAddressesLoading,
    error: tokenAddressesError,
  } = useTokenAddresses();

  const { data: userStarLevel } = useUserStarLevel(address as Address);

  const { data: isUserGoldenStar } = useIsGoldenStar(address as Address);

  const { data: goldenStarConfig } = useGoldenStarConfig();

  const { data: nextPackageId } = useNextPackageId();

  const { packageList: userStakes, isLoading: isUserStakesLoading } =
    useUserStakes();

  const { data: yReferralEarnings } = useReferralEarnings(
    address as Address,
    yYearnAddress as Address
  );

  const { data: sReferralEarnings } = useReferralEarnings(
    address as Address,
    sYearnAddress as Address
  );

  const { data: pReferralEarnings } = useReferralEarnings(
    address as Address,
    pYearnAddress as Address
  );

  const { data: claimableStarLevelRewards } = useClaimableStarLevelRewards(
    address as Address
  );

  const { data: pendingGoldenStarRewards } = usePendingGoldenStarRewards(
    address as Address
  );

  const totalReferralEarnings =
    (yReferralEarnings as number) +
    (sReferralEarnings as number) +
    (pReferralEarnings as number);

  const { data: claimableInterval } = useClaimableInterval();

  useAccountEffect({
    onConnect: () => {},
    onDisconnect: () => {
      console.info("%c⏹️ Disconnecting wallet", "color: #dc2626");
      disconnectWallet();
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      console.info("%c🔄 Fetching asset details", "color: #bada55");

      refetchTokenDetails();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchTokenDetails]);

  useEffect(() => {
    if (userStakes) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          activePackages: userStakes.map((p: PackageList) => ({
            id: p.internal_id || p.id || "",
            name: p.internal_id || p.id || "",
            duration: p.durationYears || 0,
            amount: Number(p.totalStaked),
            apy: p.apr || 0,
            startDate: new Date(Number(p.blockTimestamp) * 1000),
            endDate: new Date(
              (Number(p.blockTimestamp) + Number(p.claimableInterval)) * 1000
            ),
            status: p.isActive ? "active" : "inactive",
            stakeIndex: p.stakeIndex,
          })),
        };
      });
    }
  }, [userStakes, claimableInterval]);

  useEffect(() => {
    if (address) {
      setUser({
        address: address,
        email: "",
        phone: "",
        starLevel: (userStarLevel as number) || 0, // Changed to 0 to show "not achieved" state
        totalEarnings: 12500.75,
        totalVolume: 45000,
        totalReferrals: 28,
        directReferrals: 3, // Less than 5 required for 1-Star
        levelUsers: {
          1: 0, // No 1-Star users yet
          2: 0,
          3: 0,
          4: 0,
        },
        isGoldenStar: isUserGoldenStar as boolean,
        goldenStarProgress: (3 / 15) * 100, // 3 out of 15 direct referrals
        activePackages: [],
      });
    }
  }, [isConnectedWagmi, address, userStarLevel, isUserGoldenStar]);

  const disconnectWallet = () => {
    setUser(null);
    setIsConnected(false);
  };

  const updateUserProfile = (email: string, phone: string) => {
    if (user) {
      setUser({ ...user, email, phone });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        user,
        totalReferralEarnings: Number(
          totalReferralEarnings
            ? formatEther(totalReferralEarnings as unknown as bigint)
            : 0
        ),
        currentStarLevelEarnings: Number(
          claimableStarLevelRewards
            ? formatEther(claimableStarLevelRewards as unknown as bigint)
            : 0
        ),
        pendingGoldenStarRewards: Number(
          pendingGoldenStarRewards
            ? formatEther(pendingGoldenStarRewards as unknown as bigint)
            : 0
        ),
        tokenDetails: {
          balance: Number(detail.balance),
          allowance: Number(detail.allowance),
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
        nextPackageId: nextPackageId as number,
        isUserStakesLoading,
        userStakes,
        updateUserProfile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
