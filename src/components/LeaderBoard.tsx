import { Trophy, Users, Star, Eye, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import LevelDetailModal from "./LevelDetailModal";

const LeaderBoard: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(1);
  const [showLevelDetail, setShowLevelDetail] = useState(false);

  // Mock data for different levels
  const generateMockUsers = (level: number, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${level}-${i}`,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      name: `User ${level}-${i + 1}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `user${level}${i}@example.com`,
      joinDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ),
      stakedVolume: Math.floor(Math.random() * 50000) + 1000,
      totalEarnings: Math.floor(Math.random() * 5000) + 100,
      starLevel: Math.floor(Math.random() * 5) + 1,
      status:
        Math.random() > 0.2 ? "active" : ("inactive" as "active" | "inactive"),
    }));
  };

  const levels = Array.from({ length: 15 }, (_, i) => ({
    level: i + 1,
    count: Math.floor(Math.random() * 50) + 5,
    volume: Math.floor(Math.random() * 100000) + 10000,
    earnings: Math.floor(Math.random() * 5000) + 500,
    users: generateMockUsers(i + 1, Math.floor(Math.random() * 20) + 5),
    isSelected: i + 1 === selectedLevel,
  }));

  const topPerformers = [
    { rank: 1, address: "0x742d...1BA7", earnings: 15420, volume: 125000 },
    { rank: 2, address: "0x851a...2CD8", earnings: 12850, volume: 98000 },
    { rank: 3, address: "0x964b...3EF9", earnings: 10200, volume: 87500 },
  ];

  const handleLevelClick = (level: number) => {
    setSelectedLevel(level);
  };

  const handleViewDetails = (level: number) => {
    setSelectedLevel(level);
    setShowLevelDetail(true);
  };

  const selectedLevelData = levels.find((l) => l.level === selectedLevel);

  return (
    <div className="space-y-6">
      {/* 15 Level Network */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              15 Level Network
            </h3>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Click on any level to view details
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {levels.map((level) => (
            <div
              key={level.level}
              onClick={() => handleLevelClick(level.level)}
              className={`p-4 rounded-lg space-y-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                level.isSelected
                  ? "bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-500 shadow-lg"
                  : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium ${
                      level.isSelected
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    Level {level.level}
                  </span>
                  {level.isSelected && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star
                    className={`w-4 h-4 ${
                      level.isSelected ? "text-purple-500" : "text-yellow-500"
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(level.level);
                    }}
                    className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-400 hover:text-purple-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Members
                  </span>
                  <span
                    className={`font-medium ${
                      level.isSelected
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {level.count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Volume
                  </span>
                  <span
                    className={`font-medium ${
                      level.isSelected
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    ${level.volume.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Earnings
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${level.earnings.toLocaleString()}
                  </span>
                </div>
              </div>

              {level.isSelected && (
                <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(level.level);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Level Summary */}
        {selectedLevelData && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                Level {selectedLevelData.level} Overview
              </h4>
              <button
                onClick={() => handleViewDetails(selectedLevelData.level)}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View All</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-purple-600 dark:text-purple-400">
                  {selectedLevelData.count}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Members</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  ${selectedLevelData.volume.toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Volume</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600 dark:text-green-400">
                  ${selectedLevelData.earnings.toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Earnings</div>
              </div>
            </div>
          </div>
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

      {/* Level Detail Modal */}
      {showLevelDetail && selectedLevelData && (
        <LevelDetailModal
          level={selectedLevelData.level}
          users={selectedLevelData.users}
          onClose={() => setShowLevelDetail(false)}
        />
      )}
    </div>
  );
};

export default LeaderBoard;
