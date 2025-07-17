import { useContext } from "react";

import { ReferralContext, type ReferralContextType } from "../ReferralContext";

export const useReferralContext = (): ReferralContextType => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error(
      "useReferralContext must be used within a ReferralProvider"
    );
  }
  return context;
};
