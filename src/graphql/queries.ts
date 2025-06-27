import { gql } from "@apollo/client";

// User and Staking Related Queries
export const GET_USER_STAKES = gql`
  query GetUserStakes($user: Bytes!, $first: Int = 100, $skip: Int = 0) {
    stakeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      packageId
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_UNSTAKES = gql`
  query GetUserUnstakes($user: Bytes!, $first: Int = 100, $skip: Int = 0) {
    unstakeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      stakeIndex
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_CLAIMS = gql`
  query GetUserClaims($user: Bytes!, $first: Int = 100, $skip: Int = 0) {
    claimeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      stakeIndex
      reward
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Star Level and Rewards Queries
export const GET_USER_STAR_LEVEL_UPGRADES = gql`
  query GetUserStarLevelUpgrades(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    starLevelUpgradeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      newLevel
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_STAR_REWARDS_CLAIMED = gql`
  query GetUserStarRewardsClaimed(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    starRewardClaimeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      level
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_STAR_REWARDS_BREAKDOWN = gql`
  query GetUserStarRewardsBreakdown(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    starRewardClaimedBreakdowns(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      totalClaimed
      levelRewards
      isGoldenReward
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Golden Star Related Queries
export const GET_USER_GOLDEN_STAR_ACTIVATIONS = gql`
  query GetUserGoldenStarActivations(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    goldenStarActivateds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_GOLDEN_STAR_REWARDS = gql`
  query GetUserGoldenStarRewards(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    goldenStarRewardDistributeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      amount
      totalDistributedSoFar
      stakedCapLimit
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Referral Related Queries
export const GET_USER_REFERRAL_REWARDS_DISTRIBUTED = gql`
  query GetUserReferralRewardsDistributed(
    $referrer: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    referralRewardDistributeds(
      where: { referrer: $referrer }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      referrer
      level
      amount
      rewardToken
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_REFERRAL_REWARDS_CLAIMED = gql`
  query GetUserReferralRewardsClaimed(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    referralRewardsClaimeds(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      yAmount
      sAmount
      pAmount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Package Related Queries
export const GET_PACKAGES_CREATED = gql`
  query GetPackagesCreated($first: Int = 100, $skip: Int = 0) {
    packageCreateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      internal_id
      pkg_id
      pkg_durationYears
      pkg_apr
      pkg_monthlyPrincipalReturnPercent
      pkg_monthlyUnstake
      pkg_isActive
      pkg_monthlyAPRClaimable
      pkg_minStakeAmount
      pkg_compositions
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_PACKAGES_UPDATED = gql`
  query GetPackagesUpdated($first: Int = 100, $skip: Int = 0) {
    packageUpdateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      internal_id
      pkg_id
      pkg_durationYears
      pkg_apr
      pkg_monthlyPrincipalReturnPercent
      pkg_monthlyUnstake
      pkg_isActive
      pkg_monthlyAPRClaimable
      pkg_minStakeAmount
      pkg_compositions
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Emergency Withdrawals
export const GET_USER_EMERGENCY_WITHDRAWS = gql`
  query GetUserEmergencyWithdraws(
    $user: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    emergencyWithdraws(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      stakeIndex
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Star Reward Distribution
export const GET_STAR_REWARDS_DISTRIBUTED = gql`
  query GetStarRewardsDistributed(
    $star: Bytes!
    $first: Int = 100
    $skip: Int = 0
  ) {
    starRewardDistributeds(
      where: { star: $star }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      star
      level
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// System Events
export const GET_PAUSED_EVENTS = gql`
  query GetPausedEvents($first: Int = 100, $skip: Int = 0) {
    pauseds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      account
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_UNPAUSED_EVENTS = gql`
  query GetUnpausedEvents($first: Int = 100, $skip: Int = 0) {
    unpauseds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      account
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Ownership and Upgrade Events
export const GET_OWNERSHIP_TRANSFERS = gql`
  query GetOwnershipTransfers($first: Int = 100, $skip: Int = 0) {
    ownershipTransferreds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      previousOwner
      newOwner
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_UPGRADED_EVENTS = gql`
  query GetUpgradedEvents($first: Int = 100, $skip: Int = 0) {
    upgradeds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      implementation
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Star Tier Executor Updates
export const GET_STAR_TIER_EXECUTOR_UPDATES = gql`
  query GetStarTierExecutorUpdates($first: Int = 100, $skip: Int = 0) {
    starTierExecutorUpdateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      newExecutor
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Initialization Events
export const GET_INITIALIZED_EVENTS = gql`
  query GetInitializedEvents($first: Int = 100, $skip: Int = 0) {
    initializeds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      version
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Aggregate Queries for Dashboard
export const GET_USER_DASHBOARD_DATA = gql`
  query GetUserDashboardData($user: Bytes!) {
    # Get user's staking history
    stakeds: stakeds(
      where: { user: $user }
      first: 10
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      packageId
      amount
      blockTimestamp
    }

    # Get user's claims
    claimeds: claimeds(
      where: { user: $user }
      first: 10
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      stakeIndex
      reward
      blockTimestamp
    }

    # Get user's star level upgrades
    starLevelUpgradeds: starLevelUpgradeds(
      where: { user: $user }
      first: 5
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      newLevel
      blockTimestamp
    }

    # Get user's star rewards claimed
    starRewardClaimeds: starRewardClaimeds(
      where: { user: $user }
      first: 10
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      level
      amount
      blockTimestamp
    }

    # Get user's golden star activations
    goldenStarActivateds: goldenStarActivateds(
      where: { user: $user }
      first: 5
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      blockTimestamp
    }
  }
`;

// Analytics Queries
export const GET_SYSTEM_ANALYTICS = gql`
  query GetSystemAnalytics($first: Int = 1000) {
    # Total staking events
    totalStakes: stakeds(first: $first) {
      id
      amount
      blockTimestamp
    }

    # Total unstaking events
    totalUnstakes: unstakeds(first: $first) {
      id
      amount
      blockTimestamp
    }

    # Total claims
    totalClaims: claimeds(first: $first) {
      id
      reward
      blockTimestamp
    }

    # Star level upgrades
    starLevelUpgrades: starLevelUpgradeds(first: $first) {
      id
      newLevel
      blockTimestamp
    }

    # Star rewards distributed
    starRewardsDistributed: starRewardDistributeds(first: $first) {
      id
      amount
      level
      blockTimestamp
    }

    # Golden star activations
    goldenStarActivations: goldenStarActivateds(first: $first) {
      id
      blockTimestamp
    }
  }
`;

// Filtered Queries with Date Range
export const GET_EVENTS_BY_DATE_RANGE = gql`
  query GetEventsByDateRange(
    $startTimestamp: BigInt!
    $endTimestamp: BigInt!
    $user: Bytes
  ) {
    stakeds: stakeds(
      where: {
        user: $user
        blockTimestamp_gte: $startTimestamp
        blockTimestamp_lte: $endTimestamp
      }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      packageId
      amount
      blockTimestamp
    }

    unstakeds: unstakeds(
      where: {
        user: $user
        blockTimestamp_gte: $startTimestamp
        blockTimestamp_lte: $endTimestamp
      }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      stakeIndex
      amount
      blockTimestamp
    }

    claimeds: claimeds(
      where: {
        user: $user
        blockTimestamp_gte: $startTimestamp
        blockTimestamp_lte: $endTimestamp
      }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      stakeIndex
      reward
      blockTimestamp
    }
  }
`;

// Package-specific queries
export const GET_PACKAGE_STAKES = gql`
  query GetPackageStakes($packageId: Int!, $first: Int = 100, $skip: Int = 0) {
    stakeds(
      where: { packageId: $packageId }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      packageId
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Level-specific queries
export const GET_LEVEL_REWARDS = gql`
  query GetLevelRewards($level: Int!, $first: Int = 100, $skip: Int = 0) {
    starRewardClaimeds(
      where: { level: $level }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      user
      level
      amount
      blockTimestamp
    }
  }
`;

// Transaction hash lookup
export const GET_TRANSACTION_BY_HASH = gql`
  query GetTransactionByHash($transactionHash: Bytes!) {
    stakeds(where: { transactionHash: $transactionHash }) {
      id
      user
      packageId
      amount
      blockTimestamp
    }
    unstakeds(where: { transactionHash: $transactionHash }) {
      id
      user
      stakeIndex
      amount
      blockTimestamp
    }
    claimeds(where: { transactionHash: $transactionHash }) {
      id
      user
      stakeIndex
      reward
      blockTimestamp
    }
    starRewardClaimeds(where: { transactionHash: $transactionHash }) {
      id
      user
      level
      amount
      blockTimestamp
    }
  }
`;

// Additional queries for specific use cases
export const GET_ACTIVE_PACKAGES = gql`
  query GetActivePackages($first: Int = 100, $skip: Int = 0) {
    packageCreateds(
      where: { pkg_isActive: true }
      first: $first
      skip: $skip
      orderBy: pkg_id
      orderDirection: asc
    ) {
      id
      internal_id
      pkg_id
      pkg_durationYears
      pkg_apr
      pkg_monthlyPrincipalReturnPercent
      pkg_monthlyUnstake
      pkg_isActive
      pkg_monthlyAPRClaimable
      pkg_minStakeAmount
      pkg_compositions
      blockTimestamp
    }
  }
`;

export const GET_PACKAGE_BY_ID = gql`
  query GetPackageById($pkgId: Int!) {
    packageCreateds(
      where: { pkg_id: $pkgId }
      first: 1
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      internal_id
      pkg_id
      pkg_durationYears
      pkg_apr
      pkg_monthlyPrincipalReturnPercent
      pkg_monthlyUnstake
      pkg_isActive
      pkg_monthlyAPRClaimable
      pkg_minStakeAmount
      pkg_compositions
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_STAKE_SUMMARY = gql`
  query GetUserStakeSummary($user: Bytes!) {
    stakeds: stakeds(
      where: { user: $user }
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      packageId
      amount
      blockTimestamp
    }

    unstakeds: unstakeds(
      where: { user: $user }
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      stakeIndex
      amount
      blockTimestamp
    }

    claimeds: claimeds(
      where: { user: $user }
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      stakeIndex
      reward
      blockTimestamp
    }
  }
`;

export const GET_REFERRAL_ANALYTICS = gql`
  query GetReferralAnalytics($referrer: Bytes!, $first: Int = 1000) {
    referralRewardDistributeds(
      where: { referrer: $referrer }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      level
      amount
      rewardToken
      blockTimestamp
    }

    referralRewardsClaimeds(
      where: { user: $referrer }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      yAmount
      sAmount
      pAmount
      blockTimestamp
    }
  }
`;

export const GET_STAR_LEVEL_ANALYTICS = gql`
  query GetStarLevelAnalytics($user: Bytes!, $first: Int = 1000) {
    starLevelUpgradeds(
      where: { user: $user }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      newLevel
      blockTimestamp
    }

    starRewardClaimeds(
      where: { user: $user }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      level
      amount
      blockTimestamp
    }

    starRewardClaimedBreakdowns(
      where: { user: $user }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      totalClaimed
      levelRewards
      isGoldenReward
      blockTimestamp
    }
  }
`;
