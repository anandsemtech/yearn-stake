import { Star, Crown, Award } from "lucide-react";

import { StarLevelData, GoldenStarData } from "./types";

export const starLevels: StarLevelData[] = [
  {
    level: 1,
    name: "1-Star",
    requirement: "5 direct referrals",
    directReferralsRequired: 5,
    levelUsersRequired: {},
    color: "amber-600",
    bgColor: "amber-50",
    rewards: ["25% of 1st-level users monthly APR", "12 months reward period"],
    icon: Star,
  },
  {
    level: 2,
    name: "2-Star",
    requirement: "2 users who are 1-Star",
    directReferralsRequired: 0,
    levelUsersRequired: { 1: 2 },
    color: "gray-400",
    bgColor: "gray-50",
    rewards: ["15% of 2nd-level users monthly APR", "12 months reward period"],
    icon: Star,
  },
  {
    level: 3,
    name: "3-Star",
    requirement: "2 users who are 2-Star",
    directReferralsRequired: 0,
    levelUsersRequired: { 2: 2 },
    color: "yellow-500",
    bgColor: "yellow-50",
    rewards: ["10% of 3rd-level users monthly APR", "12 months reward period"],
    icon: Star,
  },
  {
    level: 4,
    name: "4-Star",
    requirement: "2 users who are 3-Star",
    directReferralsRequired: 0,
    levelUsersRequired: { 3: 2 },
    color: "blue-500",
    bgColor: "blue-50",
    rewards: ["8% of 4th-level users monthly APR", "12 months reward period"],
    icon: Crown,
  },
  {
    level: 5,
    name: "5-Star",
    requirement: "2 users who are 4-Star",
    directReferralsRequired: 0,
    levelUsersRequired: { 4: 2 },
    color: "purple-500",
    bgColor: "purple-50",
    rewards: ["5% of 5th-level users monthly APR", "12 months reward period"],
    icon: Crown,
  },
];

export const goldenStar: GoldenStarData = {
  name: "Golden Star",
  requirement: "15 direct referrals within 30 days",
  directReferralsRequired: 15,
  timeWindow: 30,
  color: "yellow-400",
  bgColor: "yellow-50",
  rewards: [
    "25% of 1st-level users APR (like 1-Star)",
    "12 months OR until earning 10× total stake",
    "Auto-tracked by smart contract",
    "Capped rewards system",
  ],
  icon: Award,
};
