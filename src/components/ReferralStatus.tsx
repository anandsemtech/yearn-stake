import { UserCheck } from "lucide-react";
import React, { useMemo } from "react";
import { useAccount } from "wagmi";

import { useReferralContext } from "../contexts/hooks/useReferralContext";

function shorten(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

function getRefFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  // support a few common keys
  return sp.get("ref") || sp.get("referrer") || sp.get("r");
}

const ReferralStatus: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { referralData, hasValidReferral } = useReferralContext();

  // Gate by URL param presence
  const refParam = useMemo(getRefFromUrl, []);

  // Hide when disconnected / no address / no ref param
  if (!isConnected || !address || !refParam) return null;

  // Also require a valid referral in context
  const refAddr = referralData?.referrerAddress;
  if (!hasValidReferral() || !refAddr) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
      <UserCheck className="w-4 h-4 text-green-400" />
      <div className="text-sm">
        <span className="text-green-400 font-medium">Referred by: </span>
        <span className="text-gray-300 font-mono">{shorten(refAddr)}</span>
      </div>
    </div>
  );
};

export default ReferralStatus;
