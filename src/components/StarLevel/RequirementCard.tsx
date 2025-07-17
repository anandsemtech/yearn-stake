import React from "react";

interface RequirementCardProps {
  current: number;
  target: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  current,
  target,
  label,
  icon: Icon,
  color,
}) => (
  <div className={`bg-${color}/10 rounded-xl p-4 border border-${color}/20`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 text-${color} dark:text-white`} />
        <span className="text-sm font-medium text-gray-700 dark:text-white">
          {label}
        </span>
      </div>
      <span className={`text-sm font-bold text-${color} dark:text-white`}>
        {current}/{target}
      </span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-1000 ease-out`}
        style={{
          width: `${Math.min((current / target) * 100, 100)}%`,
          backgroundColor: `black`,
        }}
      />
    </div>
  </div>
);

export default RequirementCard;
