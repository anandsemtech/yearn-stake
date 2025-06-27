import React from "react";
import { useAccount } from "wagmi";

import {
  useUserBasicInfo,
  usePackage,
  useGoldenStarConfig,
  useClaimableStarLevelRewards,
  useUserStarLevelInfo,
} from "./useYearnTogetherHooks";

export const YearnTogetherExample: React.FC = () => {
  const { address } = useAccount();

  // Example usage of various hooks
  const { data: userInfo, isLoading: userLoading } = useUserBasicInfo(address!);
  const { data: package1, isLoading: packageLoading } = usePackage(1);
  const { data: goldenStarConfig, isLoading: configLoading } =
    useGoldenStarConfig();
  const { data: claimableRewards, isLoading: rewardsLoading } =
    useClaimableStarLevelRewards(address!);
  const { data: starLevelInfo, isLoading: starLevelLoading } =
    useUserStarLevelInfo(address!, 1);

  if (
    userLoading ||
    packageLoading ||
    configLoading ||
    rewardsLoading ||
    starLevelLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">YearnTogether Contract Data</h1>

      {/* User Basic Info */}
      {userInfo && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <div className="space-y-1">
            <p>
              <strong>Star Level:</strong> {userInfo.starLevel}
            </p>
            <p>
              <strong>Total Staked:</strong> {userInfo.totalStaked?.toString()}
            </p>
            <p>
              <strong>Stake Counts:</strong> {userInfo.stakeCounts}
            </p>
            <p>
              <strong>Is Golden Star:</strong>{" "}
              {userInfo.isGoldenStar ? "Yes" : "No"}
            </p>
          </div>
        </div>
      )}

      {/* Package Information */}
      {package1 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Package 1 Information</h2>
          <div className="space-y-1">
            <p>
              <strong>Duration Years:</strong> {package1.durationYears}
            </p>
            <p>
              <strong>APR:</strong> {package1.apr}%
            </p>
            <p>
              <strong>Monthly Principal Return:</strong>{" "}
              {package1.monthlyPrincipalReturnPercent}%
            </p>
            <p>
              <strong>Monthly Unstake:</strong>{" "}
              {package1.monthlyUnstake ? "Yes" : "No"}
            </p>
            <p>
              <strong>Is Active:</strong> {package1.isActive ? "Yes" : "No"}
            </p>
            <p>
              <strong>Monthly APR Claimable:</strong>{" "}
              {package1.monthlyAPRClaimable ? "Yes" : "No"}
            </p>
            <p>
              <strong>Min Stake Amount:</strong>{" "}
              {package1.minStakeAmount?.toString()}
            </p>
          </div>
        </div>
      )}

      {/* Golden Star Config */}
      {goldenStarConfig && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Golden Star Configuration
          </h2>
          <div className="space-y-1">
            <p>
              <strong>Min Referrals:</strong> {goldenStarConfig.minReferrals}
            </p>
            <p>
              <strong>Time Window:</strong> {goldenStarConfig.timeWindow}
            </p>
            <p>
              <strong>Reward Percent:</strong> {goldenStarConfig.rewardPercent}%
            </p>
            <p>
              <strong>Reward Duration:</strong>{" "}
              {goldenStarConfig.rewardDuration}
            </p>
            <p>
              <strong>Reward Cap Multiplier:</strong>{" "}
              {goldenStarConfig.rewardCapMultiplier}
            </p>
          </div>
        </div>
      )}

      {/* Claimable Rewards */}
      {claimableRewards && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Claimable Star Level Rewards
          </h2>
          <div className="space-y-1">
            <p>
              <strong>Total Claimable:</strong>{" "}
              {claimableRewards.totalClaimable?.toString()}
            </p>
            <div>
              <strong>Level Claimables:</strong>
              <ul className="ml-4">
                {claimableRewards.levelClaimables?.map((amount, index) => (
                  <li key={index}>
                    Level {index + 1}: {amount?.toString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Star Level Info */}
      {starLevelInfo && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Star Level 1 Information
          </h2>
          <div className="space-y-1">
            <p>
              <strong>Activation:</strong>{" "}
              {starLevelInfo.activation?.toString()}
            </p>
            <p>
              <strong>Claimed:</strong> {starLevelInfo.claimed?.toString()}
            </p>
            <p>
              <strong>Earnings:</strong> {starLevelInfo.earnings?.toString()}
            </p>
            <p>
              <strong>Percent:</strong> {starLevelInfo.percent?.toString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearnTogetherExample;
