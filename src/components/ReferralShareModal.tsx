import { Copy, X, UserCheck, UserX } from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { useReferralContext } from "../contexts/ReferralContext";

interface ReferralShareModalProps {
  onClose: () => void;
}

const mockData = {
  directReferrals: 3,
  totalNetwork: 28,
  referralEarnings: 3750.225,
};

const generateQRCode = (link: string) => {
  // Simple QR code generation using a service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    link
  )}`;
  return qrCodeUrl;
};

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const { referralData, hasValidReferral, clearReferral } =
    useReferralContext();
  const referralLink = `${window.location.origin}/ref/${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // handle error
    }
  };

  const handleClearReferral = () => {
    clearReferral();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#181C2A] rounded-2xl shadow-xl w-full max-w-2xl p-6 relative text-white">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold">Share Your Referral Link</div>
            <div className="text-xs text-gray-400">
              Invite friends and earn rewards together
            </div>
          </div>
        </div>

        {/* Referral Status Section */}
        {hasValidReferral() && referralData && (
          <div className="mb-6 p-4 bg-[#2B2F45] rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-semibold text-green-400">
                    Referred by
                  </div>
                  <div className="text-xs text-gray-300 font-mono">
                    {referralData.referrerAddress.slice(0, 6)}...
                    {referralData.referrerAddress.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(referralData.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClearReferral}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove referral"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          <div className="bg-[#2B2F45] rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-400">
              {mockData.directReferrals}
            </div>
            <div className="text-xs text-gray-400 mt-1">Direct Referrals</div>
          </div>
          <div className="bg-[#2B2F45] rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-400">
              {mockData.totalNetwork}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Network</div>
          </div>
          <div className="bg-[#2B2F45] rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-400 break-words max-w-full overflow-hidden">
              ${mockData.referralEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Referral Earnings</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm font-semibold mb-1">Your Referral Link</div>
          <div className="bg-[#23263A] rounded-xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center bg-[#181C2A] rounded px-2 py-1 mb-2">
              <span className="truncate text-xs text-gray-300 flex-1">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="ml-2 p-1 hover:bg-[#23263A] rounded"
              >
                <Copy className="w-4 h-4 text-purple-400" />
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-600 py-2 rounded-lg font-semibold flex items-center justify-center"
            >
              {copied ? "Copied!" : "Copy Referral Link"}
            </button>
          </div>
        </div>
        <div className="mb-2">
          <div className="text-sm font-semibold mb-2">QR Code</div>
          <div className="flex items-center justify-center bg-[#23263A] rounded-xl p-4">
            {/* Placeholder for QR code */}
            <div className="w-24 h-24 bg-gray-700 rounded flex items-center justify-center text-gray-400">
              <img
                src={generateQRCode(referralLink)}
                alt="QR Code"
                className="border-2 border-gray-200 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralShareModal;
