import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "wagmi";

import { useTokenDetails } from "../web3/ReadContract/useTokenDetails";

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
  activePackages: Package[];
}

interface Package {
  id: string;
  name: string;
  duration: number;
  amount: number;
  apy: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "pending";
}

interface TokenDetails {
  balance: number;
  allowance: number;
  isLoading: boolean;
  error: Error | null;
}

interface WalletContextType {
  isConnected: boolean;
  user: User | null;
  tokenDetails: TokenDetails;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateUserProfile: (email: string, phone: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

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

  useEffect(() => {
    const interval = setInterval(() => {
      console.info("%c🔄 Fetching asset details", "color: #bada55");

      refetchTokenDetails();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchTokenDetails]);

  useEffect(() => {
    if (address) {
      setUser({
        address: address,
        email: "",
        phone: "",
        starLevel: 2, // Changed to 0 to show "not achieved" state
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
        isGoldenStar: false,
        goldenStarProgress: (3 / 15) * 100, // 3 out of 15 direct referrals
        activePackages: [
          {
            id: "1",
            name: "2 Year Package",
            duration: 2,
            amount: 5000,
            apy: 12,
            startDate: new Date("2024-01-15"),
            endDate: new Date("2026-01-15"),
            status: "active",
          },
          {
            id: "2",
            name: "1 Year Package",
            duration: 1,
            amount: 2500,
            apy: 8,
            startDate: new Date("2024-03-01"),
            endDate: new Date("2025-03-01"),
            status: "active",
          },
        ],
      });
    }
  }, [isConnectedWagmi, address]);

  const connectWallet = async () => {
    // Mock wallet connection with updated user data showing "not achieved" state
    const mockUser: User = {
      address: "0x742d35Cc6634C0532925a3b8D35b4E7553f31BA7",
      email: "",
      phone: "",
      starLevel: 2, // Changed to 0 to show "not achieved" state
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
      isGoldenStar: false,
      goldenStarProgress: (3 / 15) * 100, // 3 out of 15 direct referrals
      activePackages: [
        {
          id: "1",
          name: "2 Year Package",
          duration: 2,
          amount: 5000,
          apy: 12,
          startDate: new Date("2024-01-15"),
          endDate: new Date("2026-01-15"),
          status: "active",
        },
        {
          id: "2",
          name: "1 Year Package",
          duration: 1,
          amount: 2500,
          apy: 8,
          startDate: new Date("2024-03-01"),
          endDate: new Date("2025-03-01"),
          status: "active",
        },
      ],
    };

    setUser(mockUser);
    setIsConnected(true);
  };

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
        tokenDetails: {
          balance: Number(detail.balance),
          allowance: Number(detail.allowance),
          error,
          isLoading: isTokenDetailLoading,
        },
        connectWallet,
        disconnectWallet,
        updateUserProfile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
