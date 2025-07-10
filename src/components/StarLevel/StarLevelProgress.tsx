import { Star, Gift, Users, Award, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

import { starLevels, goldenStar } from "./constants";
import ProgressRing from "./ProgressRing";
import RequirementCard from "./RequirementCard";
import StarIcon from "./StarIcon";
import { StarLevelProgressProps } from "./types";

const StarLevelProgress: React.FC<StarLevelProgressProps> = ({
  currentLevel,
  totalEarnings,
  directReferrals = 3,
  levelUsers = { 1: 0, 2: 0, 3: 0, 4: 0 },
  isGoldenStar = false,
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  // Show "Not Achieved" state for levels below 1-Star
  const isNotAchieved =
    currentLevel === 0 || (currentLevel === 1 && directReferrals < 5);
  const currentLevelData = isNotAchieved ? null : starLevels[currentLevel - 1];
  const nextLevelData = starLevels[currentLevel] || null;

  // Calculate progress based on requirements
  const calculateProgress = () => {
    if (isNotAchieved) {
      // Progress toward 1-Star
      return Math.min((directReferrals / 5) * 100, 100);
    }

    if (!nextLevelData) return 100;

    if (nextLevelData.directReferralsRequired > 0) {
      return Math.min(
        (directReferrals / nextLevelData.directReferralsRequired) * 100,
        100
      );
    }

    if (Object.keys(nextLevelData.levelUsersRequired).length > 0) {
      const requiredLevel = Object.keys(nextLevelData.levelUsersRequired)[0];
      const required = (
        nextLevelData.levelUsersRequired as Record<number, number>
      )[parseInt(requiredLevel)];
      const current = levelUsers[parseInt(requiredLevel)] || 0;
      return Math.min((current / required) * 100, 100);
    }

    return 0;
  };

  const progress = calculateProgress();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(progress);
    }, 500);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="space-y-8">
      {/* Star Level Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
          Affiliate Star Journey
        </h3>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2" />
          <div
            className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r ${
              isNotAchieved
                ? "from-gray-400 to-gray-400"
                : `from-${currentLevelData?.color} to-${currentLevelData?.color}/60`
            } rounded-full transform -translate-y-1/2 transition-all duration-2000 ease-out`}
            style={{
              width: `${
                isNotAchieved ? 0 : (currentLevel / starLevels.length) * 100
              }%`,
            }}
          />

          {/* Star levels */}
          <div className="relative flex justify-between items-center">
            {starLevels.map((level) => (
              <div key={level.level} className="flex flex-col items-center">
                <StarIcon
                  level={level.level}
                  isActive={level.level === currentLevel && !isNotAchieved}
                  isCompleted={level.level < currentLevel && !isNotAchieved}
                  starLevels={starLevels}
                  goldenStar={goldenStar}
                />
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {level.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {level.requirement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Golden Star Timeline Item */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <StarIcon
                level={1}
                isActive={isGoldenStar}
                isCompleted={isGoldenStar}
                isGolden={true}
                size="w-12 h-12"
                starLevels={starLevels}
                goldenStar={goldenStar}
              />
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-yellow-600">
                  🏅 Golden Star
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Special Achievement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Not Achieved State */}
      {isNotAchieved && (
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    Star Level Not Achieved
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    You need 5 direct referrals to achieve 1-Star level
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                  ${totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Earnings
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <ProgressRing
                  progress={animationProgress}
                  color="amber-500"
                  size={140}
                  strokeWidth={10}
                />
                <div className="mt-4 text-center">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Progress to 1-Star
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Requirements for 1-Star:
                </h4>

                <RequirementCard
                  current={directReferrals}
                  target={5}
                  label="Direct Referrals"
                  icon={Users}
                  color="amber-500"
                />

                <div className="mt-6">
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    1-Star Benefits:
                  </h5>
                  <div className="space-y-2">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          25% of 1st-level users monthly APR
                        </span>
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          12 months reward period
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Level Display (only if achieved) */}
      {!isNotAchieved && currentLevelData && (
        <div className="relative">
          <div
            className={`bg-gradient-to-br from-${currentLevelData.color}/10 to-${currentLevelData.color}/5 dark:from-${currentLevelData.color}/20 dark:to-${currentLevelData.color}/10 rounded-3xl p-8 border border-${currentLevelData.color}/20`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <StarIcon
                    level={currentLevel}
                    isActive={true}
                    isCompleted={true}
                    size="w-16 h-16"
                    starLevels={starLevels}
                    goldenStar={goldenStar}
                  />
                  {/* Animated particles around current star */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 bg-${currentLevelData.color} rounded-full opacity-60`}
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) rotate(${
                          (360 / 6) * i + animationProgress * 2
                        }deg) translateX(40px)`,
                        animation: "pulse 2s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentLevelData.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentLevelData.requirement}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Earnings
                </div>
              </div>
            </div>

            {/* Current Level Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {currentLevelData.rewards.map((reward, index) => (
                <div
                  key={index}
                  className={`bg-${currentLevelData.color}/10 rounded-xl p-4 border border-${currentLevelData.color}/20`}
                >
                  <div className="flex items-center space-x-2">
                    <Gift
                      className={`w-4 h-4 text-${currentLevelData.color}`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress to Next Level (only if not at max level) */}
      {nextLevelData && !isNotAchieved && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Progress to {nextLevelData.name}
            </h3>
            <div className="flex items-center space-x-2">
              <StarIcon
                level={currentLevel + 1}
                isActive={false}
                isCompleted={false}
                starLevels={starLevels}
                goldenStar={goldenStar}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {nextLevelData.requirement}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={animationProgress}
                color={nextLevelData.color}
                size={140}
                strokeWidth={10}
              />
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Level Progress
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}% Complete
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Requirements:
              </h4>

              {nextLevelData.directReferralsRequired > 0 && (
                <RequirementCard
                  current={directReferrals}
                  target={nextLevelData.directReferralsRequired}
                  label="Direct Referrals"
                  icon={Users}
                  color={nextLevelData.color}
                />
              )}

              {Object.keys(nextLevelData.levelUsersRequired).map((level) => (
                <RequirementCard
                  key={level}
                  current={levelUsers[parseInt(level)] || 0}
                  target={
                    (
                      nextLevelData.levelUsersRequired as Record<number, number>
                    )[parseInt(level)]
                  }
                  label={`${level}-Star Users`}
                  icon={Star}
                  color={nextLevelData.color}
                />
              ))}

              {/* Next Level Benefits Preview */}
              <div className="mt-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                  Unlock Rewards:
                </h5>
                {nextLevelData.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className={`bg-${nextLevelData.color}/10 rounded-lg p-3 mb-2 border border-${nextLevelData.color}/20`}
                  >
                    <div className="flex items-center space-x-2">
                      <Gift className={`w-4 h-4 text-${nextLevelData.color}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {reward}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Golden Star Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <StarIcon
              level={1}
              isActive={isGoldenStar}
              isCompleted={isGoldenStar}
              isGolden={true}
              size="w-16 h-16"
              starLevels={starLevels}
              goldenStar={goldenStar}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>🏅 Golden Star</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {goldenStar.requirement}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">
              {directReferrals}/15
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Direct Referrals
            </div>
          </div>
        </div>

        {/* Golden Star Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <ProgressRing
              progress={(directReferrals / 15) * 100}
              color="yellow-500"
              size={140}
              strokeWidth={10}
              isGolden={true}
            />
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Golden Star Progress
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((directReferrals / 15) * 100)}% Complete
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Golden Star Benefits:
            </h4>
            {goldenStar.rewards.map((reward, index) => (
              <div
                key={index}
                className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {reward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarLevelProgress;
