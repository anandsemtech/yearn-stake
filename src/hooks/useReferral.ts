import { useEffect, useState } from "react";

import {
  getStoredReferralData,
  storeReferralData,
  clearReferralData,
  isReferralDataValid,
  extractReferralFromUrl,
  type ReferralData,
} from "../utils/referral";

export const useReferral = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize referral data on mount
  useEffect(() => {
    const initializeReferral = () => {
      // Check if there's a referral in the URL
      const urlReferral = extractReferralFromUrl();

      if (urlReferral) {
        // Store the referral from URL
        storeReferralData(urlReferral);
        setReferralData({
          referrerAddress: urlReferral,
          timestamp: Date.now(),
          source: "url",
        });
      } else {
        // Check for existing stored referral data
        const storedData = getStoredReferralData();
        if (storedData && isReferralDataValid()) {
          setReferralData(storedData);
        }
      }

      setIsLoading(false);
    };

    initializeReferral();
  }, []);

  const setReferral = (referrerAddress: string, source: string = "manual") => {
    const newReferralData: ReferralData = {
      referrerAddress,
      timestamp: Date.now(),
      source,
    };

    storeReferralData(referrerAddress);
    setReferralData(newReferralData);
  };

  const clearReferral = () => {
    clearReferralData();
    setReferralData(null);
  };

  const hasValidReferral = () => {
    return referralData !== null && isReferralDataValid();
  };

  return {
    referralData,
    isLoading,
    setReferral,
    clearReferral,
    hasValidReferral,
    referrerAddress: referralData?.referrerAddress || null,
  };
};
