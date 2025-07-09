export interface UserStake {
  id: string;
  user: string;
  packageId: string;
  amount: string;
  stakeIndex: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface APRClaimed {
  id: string;
  user: string;
  stakeIndex: string;
  packageId: string;
  baseAPR: string;
  netReward: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface ReferralAssigned {
  id: string;
  user: string;
  referrer: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface ReferralRewardTiersUpdated {
  id: string;
  startLevel: number;
  endLevel: number;
  rewardPercent: number;
  rewardToken: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface StarLevelTiersUpdated {
  id: string;
  newMaxStarLevel: number;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface MaxStarLevelUpdated {
  id: string;
  maxStarLevel: number;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// TypeScript interfaces for the comprehensive rewards query
export interface UserAllRewardsData {
  goldenStarRewardClaimeds: Array<{
    id: string;
    user: string;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  goldenStarRewardDistributeds: Array<{
    id: string;
    user: string;
    amount: string;
    cumulative: string;
    cap: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  referralRewardDistributeds: Array<{
    id: string;
    referrer: string;
    level: number;
    amount: string;
    rewardToken: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  referralRewardsClaimeds: Array<{
    id: string;
    user: string;
    yAmount: string;
    sAmount: string;
    pAmount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  starRewardClaimeds: Array<{
    id: string;
    user: string;
    level: number;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  starRewardDistributeds: Array<{
    id: string;
    user: string;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
}

export interface PackageCreated {
  id: string;
  internal_id: string;
  durationYears: number;
  apr: number;
  isActive: boolean;
  minStakeAmount: string;
  monthlyPrincipalReturnPercent: number;
  monthlyAPRClaimable: boolean;
  monthlyUnstake: boolean;
  claimableInterval: string;
  stakeMultiple: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface PackageUpdated {
  id: string;
  internal_id: string;
  durationYears: number;
  apr: number;
  isActive: boolean;
  minStakeAmount: string;
  monthlyPrincipalReturnPercent: number;
  monthlyAPRClaimable: boolean;
  monthlyUnstake: boolean;
  claimableInterval: string;
  stakeMultiple: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}
