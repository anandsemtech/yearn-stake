import React from "react";

import { useReferralInfo } from "./useReferralInfo";
import { useReferralInfoOptimized } from "./useReferralInfoOptimized";

/**
 * Example component showing how to use the referral hooks
 */
export const ReferralInfoExample: React.FC = () => {
  // Using the original hook (cascading queries)
  const {
    isLoading,
    error,
    totalReferrals,
    totalUsers,
    getReferralsByLevel,
    getUsersByLevel,
  } = useReferralInfo();

  // Using the optimized hook (single query)
  const optimizedHook = useReferralInfoOptimized();

  if (isLoading) {
    return <div>Loading referral data...</div>;
  }

  if (error) {
    return <div>Error loading referral data: {String(error)}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral Information</h1>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Total Referrals:</span>{" "}
            {totalReferrals}
          </div>
          <div>
            <span className="font-medium">Total Users:</span> {totalUsers}
          </div>
        </div>
      </div>

      {/* Level Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Referral Levels</h2>

        {[1, 2, 3, 4, 5].map((level) => {
          const levelData = getReferralsByLevel(level as 1 | 2 | 3 | 4 | 5);
          const users = getUsersByLevel(level as 1 | 2 | 3 | 4 | 5);

          return (
            <div key={level} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Level {level}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Count:</span> {levelData.count}
                </div>
                <div>
                  <span className="font-medium">Users:</span> {users.length}
                </div>
                <div>
                  <span className="font-medium">Referrals:</span>{" "}
                  {levelData.referrals.length}
                </div>
              </div>

              {/* Show first few users */}
              {users.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-600">Sample users: </span>
                  <span className="text-xs">
                    {users.slice(0, 3).map((user, index) => (
                      <span key={user}>
                        {user.slice(0, 6)}...{user.slice(-4)}
                        {index < Math.min(3, users.length) - 1 ? ", " : ""}
                      </span>
                    ))}
                    {users.length > 3 && ` and ${users.length - 3} more`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optimized Hook Comparison */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          Optimized Hook Comparison
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Original Total:</span>{" "}
            {totalReferrals}
          </div>
          <div>
            <span className="font-medium">Optimized Total:</span>{" "}
            {optimizedHook.totalReferrals}
          </div>
          <div>
            <span className="font-medium">Original Users:</span> {totalUsers}
          </div>
          <div>
            <span className="font-medium">Optimized Users:</span>{" "}
            {optimizedHook.totalUsers}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example of using the referral tree for advanced analytics
 */
export const ReferralTreeExample: React.FC = () => {
  const { getReferralTree, isLoading, error } = useReferralInfoOptimized();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  const referralTree = getReferralTree();

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Referral Tree Analysis</h2>

      <div className="space-y-2">
        <div>
          <span className="font-medium">Total nodes in tree:</span>{" "}
          {referralTree.size}
        </div>

        {/* Show top referrers */}
        <div>
          <span className="font-medium">Top referrers:</span>
          <div className="mt-2 space-y-1">
            {Array.from(referralTree.entries())
              .sort(([, a], [, b]) => b.length - a.length)
              .slice(0, 5)
              .map(([referrer, referrals]) => (
                <div key={referrer} className="text-sm">
                  {referrer.slice(0, 6)}...{referrer.slice(-4)}:{" "}
                  {referrals.length} referrals
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
