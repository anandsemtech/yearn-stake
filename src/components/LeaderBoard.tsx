import { Trophy, Users, Star } from "lucide-react";
import React, { useState } from "react";
import { Address } from "viem";

import { useWallet } from "../contexts/hooks/useWallet";
import { useReferralInfo } from "../graphql/hooks/useReferralInfo";
import { useReferredUserInfo } from "../graphql/hooks/useReferredUserInfo";
import { ReferralAssigned } from "../graphql/types";

import LeaderBoardTable from "./LeaderBoardTable";

import type { User } from "./LeaderBoardTable";

const LeaderBoard: React.FC = () => {
  // Only keep track of index in levelsWithData
  // Instead of selectedLevel, use selectedLevelIndex
  // Start at first level with data
  const { user } = useWallet();
  const referralInfo = useReferralInfo();
  const { level1, level2, level3, level4, level5, getUsersByLevel } =
    referralInfo;
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const { stakedUsersWithAddedInfo, isLoading: isStakedLoading } =
    useReferredUserInfo(
      getUsersByLevel(
        (selectedLevelIndex + 1) as 1 | 2 | 3 | 4 | 5
      ) as Address[]
    );

  // Helper to map ReferralAssigned[] to table user format
  const mapReferralToUser = (
    referrals: ReferralAssigned[],
    level: number
  ): User[] => {
    return referrals.map((ref, i) => ({
      id: ref.id || `${level}-${i}`,
      address: ref.user,
      name: ref.user,
      phone: "-",
      email: "-",
      joinDate: ref.blockTimestamp
        ? new Date(Number(ref.blockTimestamp) * 1000)
        : new Date(),
      stakedVolume: 0,
      totalEarnings: 0,
      starLevel: isStakedLoading
        ? 0
        : stakedUsersWithAddedInfo &&
          stakedUsersWithAddedInfo[ref.user.toLowerCase() as `0x${string}`]
        ? stakedUsersWithAddedInfo[ref.user.toLowerCase() as `0x${string}`]
            .starLevel
        : 0,
      status: "active" as "active" | "inactive",
    }));
  };
  // Get real data for levels 1-5
  const referralLevels = [level1, level2, level3, level4, level5];

  // Compose levels array: use real data for levels 1-5 if available, else empty
  const levels = Array.from({ length: 15 }, (_, i) => {
    if (i < 5 && referralLevels[i] && referralLevels[i].count > 0) {
      return {
        level: i + 1,
        count: referralLevels[i].count,
        volume: 0,
        earnings: 0,
        users: mapReferralToUser(referralLevels[i].referrals, i + 1),
      };
    }
    // fallback to empty for levels > 5 or if no data
    return {
      level: i + 1,
      count: 0,
      volume: 0,
      earnings: 0,
      users: [],
    };
  });

  // Only keep levels with user data
  const levelsWithData = levels.filter((l) => l.users && l.users.length > 0);

  // If no levels have data, show a message
  if (levelsWithData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            No data available for any level.
          </h3>
        </div>
      </div>
    );
  }

  // Clamp selectedLevelIndex to available range
  const safeSelectedLevelIndex = Math.max(
    0,
    Math.min(selectedLevelIndex, levelsWithData.length - 1)
  );
  const selectedLevelData = levelsWithData[safeSelectedLevelIndex];

  const handlePrevLevel = () => {
    setSelectedLevelIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextLevel = () => {
    setSelectedLevelIndex((prev) =>
      prev < levelsWithData.length - 1 ? prev + 1 : prev
    );
  };

  const topPerformers = [
    { rank: 1, address: "0x742d...1BA7", earnings: 15420, volume: 125000 },
    { rank: 2, address: "0x851a...2CD8", earnings: 12850, volume: 98000 },
    { rank: 3, address: "0x964b...3EF9", earnings: 10200, volume: 87500 },
  ];

  return (
    <div className="space-y-6">
      {/* 15 Level Network - Single Level View */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {(user?.starLevel ?? 0) + 1} Level Network
            </h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Navigate levels to explore your network
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center mb-6 space-x-6">
          <button
            onClick={handlePrevLevel}
            disabled={safeSelectedLevelIndex === 0}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm
              ${
                safeSelectedLevelIndex === 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:-translate-y-0.5 hover:shadow-md"
              }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center px-6 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Level {selectedLevelData.level}
            </span>
          </div>

          <button
            onClick={handleNextLevel}
            disabled={safeSelectedLevelIndex === levelsWithData.length - 1}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm
              ${
                safeSelectedLevelIndex === levelsWithData.length - 1
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:-translate-y-0.5 hover:shadow-md"
              }`}
          >
            <span>Next</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Selected Level Card */}
        {selectedLevelData && (
          <div
            className={
              "p-4 rounded-lg space-y-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-500 shadow-lg"
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  Level {selectedLevelData.level}
                </span>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Members
                </span>
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  {selectedLevelData.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Volume</span>
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  ${selectedLevelData.volume.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Earnings
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${selectedLevelData.earnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Details Table */}
        {selectedLevelData && (
          <LeaderBoardTable
            users={selectedLevelData.users}
            level={selectedLevelData.level}
          />
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Network Leaderboard
      </h2>

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Top Performers
          </h3>
        </div>

        <div className="space-y-3">
          {topPerformers.map((performer) => (
            <div
              key={performer.rank}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    performer.rank === 1
                      ? "bg-yellow-500"
                      : performer.rank === 2
                      ? "bg-gray-400"
                      : "bg-amber-600"
                  }`}
                >
                  {performer.rank}
                </div>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {performer.address}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${performer.earnings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ${performer.volume.toLocaleString()} vol
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
