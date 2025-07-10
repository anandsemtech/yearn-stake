import React from "react";

interface ProgressRingProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  isGolden?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  color,
  size = 120,
  strokeWidth = 8,
  isGolden = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${
            isGolden ? "text-yellow-400" : `text-${color}`
          } transition-all duration-1000 ease-out`}
          style={{
            filter: "drop-shadow(0 0 6px currentColor)",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              isGolden ? "text-yellow-500" : `text-${color}`
            }`}
          >
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Progress
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressRing;
