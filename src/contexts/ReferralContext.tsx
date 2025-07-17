import React, { createContext, ReactNode } from "react";

import { ReferralAssigned } from "../graphql";
import { useReferral } from "../hooks/useReferral";
import { type ReferralData } from "../utils/referral";

export interface ReferralContextType {
  referralData: ReferralData | null;
  isLoading: boolean;
  setReferral: (referrerAddress: string, source?: string) => void;
  clearReferral: () => void;
  hasValidReferral: () => boolean;
  referrerAddress: string | null;
}

export type ReferralLevelType = `level${number}`;

export interface ReferralLevelData {
  level: ReferralLevelType;
  count: number;
  referrals: ReferralAssigned[];
  users: string[];
}

export const ReferralContext = createContext<ReferralContextType | undefined>(
  undefined
);

interface ReferralProviderProps {
  children: ReactNode;
}

export const ReferralProvider: React.FC<ReferralProviderProps> = ({
  children,
}) => {
  const referralHook = useReferral();

  return (
    <ReferralContext.Provider value={referralHook}>
      {children}
    </ReferralContext.Provider>
  );
};
