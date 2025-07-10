import React from "react";

import { StarLevelData, GoldenStarData } from "./types";

interface StarIconProps {
  level: number;
  isActive: boolean;
  isCompleted?: boolean;
  isGolden?: boolean;
  size?: string;
  starLevels: StarLevelData[];
  goldenStar: GoldenStarData;
}

const StarIcon: React.FC<StarIconProps> = ({
  level,
  isActive,
  isCompleted,
  isGolden = false,
  size = "w-8 h-8",
  starLevels,
  goldenStar,
}) => {
  const levelData = isGolden ? goldenStar : starLevels[level - 1];
  if (!levelData) return null;

  const IconComponent = levelData.icon;

  return (
    <div className="relative group">
      <div
        className={`${size} relative transition-all duration-500 ${
          isCompleted ? "scale-110" : isActive ? "scale-125" : "scale-100"
        }`}
      >
        {/* Special glow for Golden Star */}
        {isGolden && (isActive || isCompleted) && (
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
        )}

        {/* Regular glow effect for active/completed stars */}
        {!isGolden && (isActive || isCompleted) && (
          <div
            className={`absolute inset-0 bg-${levelData.color} rounded-full blur-lg opacity-30 animate-pulse`}
          />
        )}

        {/* Star background */}
        <div
          className={`absolute inset-0 rounded-full ${
            isGolden
              ? isCompleted || isActive
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                : "bg-gray-200 dark:bg-gray-700"
              : isCompleted
              ? `bg-gradient-to-br from-${levelData.color} to-${levelData.color}`
              : isActive
              ? `bg-gradient-to-br from-${levelData.color}/80 to-${levelData.color}`
              : "bg-gray-200 dark:bg-gray-700"
          } transition-all duration-500`}
        />

        {/* Star icon */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <IconComponent
            className={`w-5 h-5 ${
              isCompleted || isActive ? "text-white" : "text-gray-400"
            } ${isCompleted ? "fill-current" : ""} transition-all duration-300`}
          />
        </div>

        {/* Level number or Golden indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
            isGolden
              ? isCompleted || isActive
                ? "bg-yellow-500"
                : "bg-gray-300"
              : isCompleted || isActive
              ? `bg-${levelData.color}`
              : "bg-gray-300"
          } flex items-center justify-center transition-all duration-300`}
        >
          <span
            className={`text-xs font-bold ${
              isCompleted || isActive ? "text-white" : "text-gray-600"
            }`}
          >
            {isGolden ? "★" : level}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        <div
          className={`px-3 py-2 ${
            isGolden ? "bg-yellow-500" : `bg-${levelData.color}`
          } text-white text-xs rounded-lg shadow-lg whitespace-nowrap max-w-xs`}
        >
          <div className="font-semibold">{levelData.name}</div>
          <div className="text-xs opacity-90">{levelData.requirement}</div>
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
              isGolden ? "border-t-yellow-500" : `border-t-${levelData.color}`
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default StarIcon;
