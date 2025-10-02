import { Trophy, Users, Star } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Address } from "viem";

import { useWallet } from "../contexts/hooks/useWallet";
import { useReferralInfo } from "../graphql/hooks/useReferralInfo";
import { useReferredUserInfo } from "../graphql/hooks/useReferredUserInfo";
import { ReferralAssigned } from "../graphql/types";

import LeaderBoardTable from "./LeaderBoardTable";
import type { User } from "./LeaderBoardTable";

const LeaderBoard: React.FC = () => {
  const { user } = useWallet();

  // Pull levels; avoid using functions that change identity each render
  const { level1, level2, level3, level4, level5 } = useReferralInfo();

  // Keep an index into the set of levels that actually have user data
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  // Memoize raw array of levels so referential equality is stable
  const referralLevels = useMemo(
    () => [level1, level2, level3, level4, level5],
    [level1, level2, level3, level4, level5]
  );

  // Safe helper: map ReferralAssigned[] -> LeaderBoardTable.User[]
  const mapReferralToUser = (
    referrals: ReferralAssigned[],
    level: number,
    stakedUsersWithAddedInfo: Record<`0x${string}`, { amount: bigint; starLevel: number }> | null | undefined,
    isStakedLoading: boolean
  ): User[] => {
    return referrals.map((ref, i) => {
      const key = ref.user?.toLowerCase() as `0x${string}`;
      const stakeInfo = stakedUsersWithAddedInfo ? stakedUsersWithAddedInfo[key] : undefined;

      return {
        id: ref.id || `${level}-${i}`,
        address: ref.user,
        name: ref.user,
        phone: "-",
        email: "-",
        joinDate: ref.blockTimestamp
          ? new Date(Number(ref.blockTimestamp) * 1000)
          : new Date(),
        stakedVolume: isStakedLoading ? 0 : stakeInfo ? Number(stakeInfo.amount) : 0,
        totalEarnings: 0,
        starLevel: isStakedLoading ? 0 : stakeInfo ? stakeInfo.starLevel : 0,
        status: "active",
      };
    });
  };

  // Determine which level’s addresses we need to fetch extra info for
  // Build a *stable* list of addresses based on the current selected index.
  const selectedLevelDataRaw = useMemo(() => {
    // Find all levels with >0 referrals
    const withData = referralLevels
      .map((lvl, idx) => ({
        idx,
        level: idx + 1,
        referrals: lvl?.referrals ?? [],
        count: lvl?.count ?? 0,
      }))
      .filter((l) => (l.referrals?.length ?? 0) > 0);

    return { withData };
  }, [referralLevels]);

  // Keep selectedLevelIndex within bounds when data shape changes
  useEffect(() => {
    if (selectedLevelDataRaw.withData.length === 0) {
      if (selectedLevelIndex !== 0) setSelectedLevelIndex(0);
      return;
    }
    if (selectedLevelIndex > selectedLevelDataRaw.withData.length - 1) {
      setSelectedLevelIndex(selectedLevelDataRaw.withData.length - 1);
    }
  }, [selectedLevelDataRaw.withData.length, selectedLevelIndex]);

  // Get the actual selected-with-data entry (or undefined)
  const selectedWithData = useMemo(() => {
    if (selectedLevelDataRaw.withData.length === 0) return undefined;
    const safeIndex = Math.max(
      0,
      Math.min(selectedLevelIndex, selectedLevelDataRaw.withData.length - 1)
    );
    return selectedLevelDataRaw.withData[safeIndex];
  }, [selectedLevelDataRaw.withData, selectedLevelIndex]);

  // Stable addresses for the selected level only
  const selectedAddresses: Address[] = useMemo(() => {
    if (!selectedWithData) return [];
    return (selectedWithData.referrals ?? []).map((r) => r.user as Address);
  }, [selectedWithData]);

  // Fetch staked info only for the selected level (memoized addresses)
  const {
    stakedUsersWithAddedInfo,
    totalStakedVolume,
    isLoading: isStakedLoading,
  } = useReferredUserInfo(selectedAddresses);

  // Build all 15 levels view for the UI (volume shown = aggregated totalStakedVolume)
  const levels = useMemo(() => {
    const base = Array.from({ length: 15 }, (_, i) => {
      const lvlIdx = i; // 0..14
      const src = referralLevels[lvlIdx];

      if (lvlIdx < 5 && src && (src.count ?? 0) > 0) {
        return {
          level: i + 1,
          count: src.count ?? 0,
          volume: totalStakedVolume,
          earnings: 0,
          users: mapReferralToUser(
            src.referrals ?? [],
            i + 1,
            stakedUsersWithAddedInfo,
            isStakedLoading
          ),
        };
      }

      return {
        level: i + 1,
        count: 0,
        volume: totalStakedVolume,
        earnings: 0,
        users: [] as User[],
      };
    });

    return base;
  }, [referralLevels, totalStakedVolume, stakedUsersWithAddedInfo, isStakedLoading]);

  // Only levels with user data
  const levelsWithData = useMemo(
    () => levels.filter((l) => (l.users?.length ?? 0) > 0),
    [levels]
  );

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

  // Safe read of currently selected level
  const selectedLevelData = levelsWithData[
    Math.max(0, Math.min(selectedLevelIndex, levelsWithData.length - 1))
  ];

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
            disabled={selectedLevelIndex === 0}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm
              ${
                selectedLevelIndex === 0
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
            disabled={selectedLevelIndex === levelsWithData.length - 1}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm
              ${
                selectedLevelIndex === levelsWithData.length - 1
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
                  ${selectedLevelData.volume?.toLocaleString() || 0}
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
