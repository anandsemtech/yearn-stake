import React, { useState } from "react";

import { useWallet } from "../contexts/WalletContext";

import EarningsClaimPanel from "./EarningsClaimPanel";
import EventLogs from "./EventLogs";
import LeaderBoard from "./LeaderBoard";
import PackageCards, { PackageData } from "./PackageCards";
import StakingModal from "./StakingModal";
import StarLevelProgress from "./StarLevelProgress";
import StatsOverview from "./StatsOverview";

export interface Package {
  id: string;
  name: string;
  minAmount: number;
  apy: number;
  duration: number;
}

const Dashboard: React.FC = () => {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null
  );
  const { user } = useWallet();

  const handleStakePackage = (packageData: PackageData) => {
    setSelectedPackage(packageData);
    setShowStakingModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your packages, track earnings, and monitor your affiliate
          network
        </p>
      </div>

      {/* // Token Swap Button - Top Section
      <div className="mb-8">
        <button
          onClick={() => setShowTokenSwapModal(true)}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
        >
          <Zap className="w-5 h-5" />
          <span>Swap Tokens</span>
        </button>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-4 space-y-8">
          <StatsOverview />

          <PackageCards onStakePackage={handleStakePackage} />

          {/* Earnings Claim Panel */}
          <EarningsClaimPanel />

          {/* Referral Test Component */}
          {/* <ReferralTest /> */}

          {/* Star Level Progress - Featured prominently */}
          <StarLevelProgress
            currentLevel={user?.starLevel || 0}
            currentVolume={user?.totalVolume || 15000}
            currentReferrals={user?.totalReferrals || 12}
            totalEarnings={user?.totalEarnings || 12500.75}
            directReferrals={user?.directReferrals || 3}
            levelUsers={user?.levelUsers || { 1: 0, 2: 0, 3: 0, 4: 0 }}
            isGoldenStar={user?.isGoldenStar || false}
            goldenStarProgress={user?.goldenStarProgress || 0}
          />

          <LeaderBoard />
          <EventLogs />
        </div>

        {/* Sidebar - 1 column */}
        {/* <div className="space-y-8">
          <SystemFeeds />
        </div> */}
      </div>

      {/* Bottom Section - System Feeds moved here for more space */}
      <div className="mt-8">{/* Additional space for future components */}</div>

      {showStakingModal && selectedPackage && (
        <StakingModal
          package={selectedPackage}
          onClose={() => {
            setShowStakingModal(false);
            setSelectedPackage(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
