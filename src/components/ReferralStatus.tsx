import { UserCheck } from "lucide-react";
import React from "react";

import { useReferralContext } from "../contexts/hooks/useReferralContext";

const ReferralStatus: React.FC = () => {
  const { referralData, hasValidReferral } = useReferralContext();

  if (!hasValidReferral() || !referralData) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
      <UserCheck className="w-4 h-4 text-green-400" />
      <div className="text-sm">
        <span className="text-green-400 font-medium">Referred by: </span>
        <span className="text-gray-300 font-mono">
          {referralData.referrerAddress.slice(0, 6)}...
          {referralData.referrerAddress.slice(-4)}
        </span>
      </div>
    </div>
  );
};

export default ReferralStatus;
