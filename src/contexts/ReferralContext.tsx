import React, { createContext, useContext, ReactNode } from "react";

import { useReferral } from "../hooks/useReferral";
import { type ReferralData } from "../utils/referral";

interface ReferralContextType {
  referralData: ReferralData | null;
  isLoading: boolean;
  setReferral: (referrerAddress: string, source?: string) => void;
  clearReferral: () => void;
  hasValidReferral: () => boolean;
  referrerAddress: string | null;
}

const ReferralContext = createContext<ReferralContextType | undefined>(
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

export const useReferralContext = (): ReferralContextType => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error(
      "useReferralContext must be used within a ReferralProvider"
    );
  }
  return context;
};
