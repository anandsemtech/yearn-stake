// Referral utility functions
export const REFERRAL_STORAGE_KEY = "yearn_together_referral";

export interface ReferralData {
  referrerAddress: string;
  timestamp: number;
  source: string;
}

/**
 * Extract referral address from URL path
 * Expected format: /ref/{address}
 */
export const extractReferralFromUrl = (): string | null => {
  const path = window.location.pathname;
  const refMatch = path.match(/^\/ref\/([a-zA-Z0-9]{42})$/);
  return refMatch ? refMatch[1] : null;
};

/**
 * Store referral data in localStorage
 */
export const storeReferralData = (referrerAddress: string): void => {
  const referralData: ReferralData = {
    referrerAddress,
    timestamp: Date.now(),
    source: "url",
  };

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData));
  } catch (error) {
    console.error("Failed to store referral data:", error);
  }
};

/**
 * Get stored referral data from localStorage
 */
export const getStoredReferralData = (): ReferralData | null => {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to get stored referral data:", error);
    return null;
  }
};

/**
 * Clear stored referral data
 */
export const clearReferralData = (): void => {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear referral data:", error);
  }
};

/**
 * Check if referral data is valid (not expired)
 * @param maxAgeMs Maximum age in milliseconds (default: 24 hours)
 */
export const isReferralDataValid = (
  maxAgeMs: number = 24 * 60 * 60 * 1000
): boolean => {
  const data = getStoredReferralData();
  if (!data) return false;

  const age = Date.now() - data.timestamp;
  return age < maxAgeMs;
};

/**
 * Initialize referral handling - check URL and store if valid
 */
export const initializeReferralHandling = (): void => {
  const referralAddress = extractReferralFromUrl();

  if (referralAddress) {
    // Check if we already have stored referral data
    const existingData = getStoredReferralData();

    // Only store if we don't have existing data or if the new one is more recent
    if (!existingData || existingData.timestamp < Date.now()) {
      storeReferralData(referralAddress);
      console.log("Referral address stored:", referralAddress);
    }
  }
};
