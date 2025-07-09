import React from "react";
import { formatEther } from "viem";

import { useUserAllRewards } from "../graphql";

const UserRewardsExample: React.FC = () => {
  const {
    data,
    loading,
    error,
    totalGoldenStarRewardsClaimed,
    totalGoldenStarRewardsDistributed,
    totalReferralRewardsDistributed,
    totalReferralRewardsClaimed,
    totalStarRewardsClaimed,
    getGoldenStarRewardsByDate,
    getReferralRewardsByDate,
    getStarRewardsByDate,
  } = useUserAllRewards({ first: 50 });

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
          Error loading rewards data
        </h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          {error instanceof Error
            ? error.message
            : "An error occurred while fetching rewards data."}
        </p>
      </div>
    );
  }

  // Get rewards for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentGoldenStarRewards = getGoldenStarRewardsByDate(
    thirtyDaysAgo,
    new Date()
  );
  const recentReferralRewards = getReferralRewardsByDate(
    thirtyDaysAgo,
    new Date()
  );
  const recentStarRewards = getStarRewardsByDate(thirtyDaysAgo, new Date());

  return (
    <div className="space-y-6">
      {/* Total Rewards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Golden Star Claimed
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatEther(BigInt(totalGoldenStarRewardsClaimed))} ETH
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Golden Star Distributed
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatEther(BigInt(totalGoldenStarRewardsDistributed))} ETH
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Referral Rewards
          </h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatEther(BigInt(totalReferralRewardsDistributed))} ETH
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Star Rewards
          </h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatEther(BigInt(totalStarRewardsClaimed))} ETH
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Referral Claimed (Y/S/P)
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              Y: {formatEther(BigInt(totalReferralRewardsClaimed.yAmount))}
            </p>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              S: {formatEther(BigInt(totalReferralRewardsClaimed.sAmount))}
            </p>
            <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">
              P: {formatEther(BigInt(totalReferralRewardsClaimed.pAmount))}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Golden Star Rewards */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Golden Star Rewards (30 days)
          </h3>
          <div className="space-y-2">
            {recentGoldenStarRewards.length > 0 ? (
              recentGoldenStarRewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(
                      parseInt(reward.blockTimestamp) * 1000
                    ).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatEther(BigInt(reward.amount))} ETH
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent golden star rewards
              </p>
            )}
          </div>
        </div>

        {/* Recent Referral Rewards */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Referral Rewards (30 days)
          </h3>
          <div className="space-y-2">
            {recentReferralRewards.length > 0 ? (
              recentReferralRewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(
                      parseInt(reward.blockTimestamp) * 1000
                    ).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatEther(BigInt(reward.amount))} {reward.rewardToken}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent referral rewards
              </p>
            )}
          </div>
        </div>

        {/* Recent Star Rewards */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Star Rewards (30 days)
          </h3>
          <div className="space-y-2">
            {recentStarRewards.length > 0 ? (
              recentStarRewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(
                      parseInt(reward.blockTimestamp) * 1000
                    ).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {formatEther(BigInt(reward.amount))} ETH
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent star rewards
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Data Debug (optional) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Debug Info
          </h3>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UserRewardsExample;
