export interface StarLevelData {
  level: number;
  name: string;
  requirement: string;
  directReferralsRequired: number;
  levelUsersRequired: Record<number, number>;
  color: string;
  bgColor: string;
  rewards: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export interface GoldenStarData {
  name: string;
  requirement: string;
  directReferralsRequired: number;
  timeWindow: number;
  color: string;
  bgColor: string;
  rewards: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export interface StarLevelProgressProps {
  currentLevel: number;
  currentVolume: number;
  currentReferrals: number;
  directReferrals?: number;
  levelUsers?: { [key: number]: number };
  isGoldenStar?: boolean;
  goldenStarProgress?: number;
}
