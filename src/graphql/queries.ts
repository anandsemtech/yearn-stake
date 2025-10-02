import { gql } from "@apollo/client";

/* =========================
   USER & STAKING QUERIES
   ========================= */

export const GET_USER_STAKES = gql`
  query GetUserStakes($user: String!, $first: Int = 100, $skip: Int = 0) {
    stakes(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      packageId
      timestamp
    }
    unstakes(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      timestamp
    }
  }
`;

export const GET_MULTIPLE_USER_STAKES = gql`
  query GetMultipleUserStakes($users: [String!]!, $first: Int = 100, $skip: Int = 0) {
    stakes(
      where: { user_in: $users }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      packageId
      timestamp
    }
  }
`;

export const GET_USER_UNSTAKES = gql`
  query GetUserUnstakes($user: String!, $first: Int = 100, $skip: Int = 0) {
    unstakes(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      timestamp
    }
  }
`;

/* =========================
   APR CLAIMS
   ========================= */

export const GET_USER_APR_CLAIMS = gql`
  query GetUserAprClaims($user: String!, $first: Int = 100, $skip: Int = 0) {
    aprclaims(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      packageId
      timestamp
    }
  }
`;

export const GET_APR_CLAIMS_BY_PACKAGE = gql`
  query GetAprClaimsByPackage($packageId: Int!, $first: Int = 100, $skip: Int = 0) {
    aprclaims(
      where: { packageId: $packageId }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      packageId
      timestamp
    }
  }
`;

/* =========================
   PACKAGES
   ========================= */

export const GET_PACKAGES = gql`
  query GetPackages($where: Package_filter, $first: Int = 1000, $skip: Int = 0) {
    packages(
      where: $where
      first: $first
      skip: $skip
      orderBy: packageId
      orderDirection: desc
    ) {
      id
      packageId
      durationInDays
      isActive
      monthlyUnstake
      monthlyAPRClaimable
      monthlyPrincipalReturnPercent
      minStakeAmount
      claimableInterval
      stakeMultiple
      principalLocked
    }
  }
`;

export const GET_PACKAGE_BY_ID = gql`
  query GetPackageById($packageId: Int!) {
    packages(
      where: { packageId: $packageId }
      first: 1
      orderBy: packageId
      orderDirection: desc
    ) {
      id
      packageId
      durationInDays
      isActive
      monthlyUnstake
      monthlyAPRClaimable
      monthlyPrincipalReturnPercent
      minStakeAmount
      claimableInterval
      stakeMultiple
      principalLocked
    }
  }
`;

/* =========================
   STAR LEVEL / REWARDS
   ========================= */

export const GET_USER_STAR_LEVEL_CHANGES = gql`
  query GetUserStarLevelChanges($user: String!, $first: Int = 100, $skip: Int = 0) {
    starLevelChanges(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      newLevel
      timestamp
    }
  }
`;

export const GET_USER_STAR_REWARD_PAYOUTS = gql`
  query GetUserStarRewardPayouts($user: String!, $first: Int = 100, $skip: Int = 0) {
    starRewardPayouts(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      level
      amount
      timestamp
    }
  }
`;

/* =========================
   GOLDEN STAR
   ========================= */

export const GET_USER_GOLDEN_STAR_ACTIVATIONS = gql`
  query GetUserGoldenStarActivations($user: String!, $first: Int = 100, $skip: Int = 0) {
    goldenStarActivations(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      activatedAt
      timestamp
    }
  }
`;

export const GET_USER_GOLDEN_STAR_PAYOUTS = gql`
  query GetUserGoldenStarPayouts($user: String!, $first: Int = 100, $skip: Int = 0) {
    goldenStarPayouts(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      amount
      timestamp
    }
  }
`;

/* =========================
   REFERRALS
   ========================= */

export const GET_REFERRAL_EARNINGS = gql`
  query GetReferralEarnings($user: String!, $first: Int = 100, $skip: Int = 0) {
    referralEarnings(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      level
      amount
      timestamp
    }
  }
`;

/* =========================
   DASHBOARD (AGGREGATE)
   ========================= */

export const GET_USER_DASHBOARD_DATA = gql`
  query GetUserDashboardData($user: String!) {
    stakes: stakes(
      where: { user: $user }
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      packageId
      timestamp
    }

    unstakes: unstakes(
      where: { user: $user }
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      stakeId
      timestamp
    }

    aprclaims: aprclaims(
      where: { user: $user }
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      stakeId
      packageId
      timestamp
    }

    starLevelChanges: starLevelChanges(
      where: { user: $user }
      first: 5
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      newLevel
      timestamp
    }

    starRewardPayouts: starRewardPayouts(
      where: { user: $user }
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      level
      amount
      timestamp
    }

    goldenStarActivations: goldenStarActivations(
      where: { user: $user }
      first: 5
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      activatedAt
      timestamp
    }
  }
`;

/* =========================
   ANALYTICS / RANGES
   ========================= */

export const GET_SYSTEM_ANALYTICS = gql`
  query GetSystemAnalytics($first: Int = 1000) {
    totalStakes: stakes(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
    }
    totalUnstakes: unstakes(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
    }
    totalAprClaims: aprclaims(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
    }
    starLevelUpgrades: starLevelChanges(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      newLevel
      timestamp
    }
    starRewardPayouts: starRewardPayouts(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      level
      timestamp
    }
    goldenStarActivations: goldenStarActivations(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      activatedAt
      timestamp
    }
  }
`;

export const GET_EVENTS_BY_DATE_RANGE = gql`
  query GetEventsByDateRange($start: BigInt!, $end: BigInt!, $user: String) {
    stakes: stakes(
      where: { user: $user, timestamp_gte: $start, timestamp_lte: $end }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      packageId
      timestamp
    }

    unstakes: unstakes(
      where: { user: $user, timestamp_gte: $start, timestamp_lte: $end }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      timestamp
    }

    aprclaims: aprclaims(
      where: { user: $user, timestamp_gte: $start, timestamp_lte: $end }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      stakeId
      packageId
      timestamp
    }
  }
`;

/* =========================
   PACKAGE- / LEVEL-SPECIFIC
   ========================= */

export const GET_PACKAGE_STAKES = gql`
  query GetPackageStakes($packageId: Int!, $first: Int = 100, $skip: Int = 0) {
    stakes(
      where: { packageId: $packageId }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      packageId
      timestamp
    }
  }
`;

export const GET_LEVEL_REWARD_PAYOUTS = gql`
  query GetLevelRewardPayouts($level: Int!, $first: Int = 100, $skip: Int = 0) {
    starRewardPayouts(
      where: { level: $level }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      level
      amount
      timestamp
    }
  }
`;



/**
 * Back-compat: old code expected GET_REFERRER_ASSIGNMENTS using `referralAssigneds`.
 * New schema doesn’t have that; we approximate with referralEarnings.
 * NOTE: `referrer` will be an object { id }. If your old code expects a string,
 * read it as `row.referrer.id`.
 */
export const GET_REFERRER_ASSIGNMENTS = gql`
  query GetReferrerAssignments($referrer: String!, $first: Int = 100, $skip: Int = 0) {
    referralAssigneds: referralEarnings(
      where: { user: $referrer }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      # Alias user -> referrer for compatibility; access as referrer.id in TS
      referrer: user { id }
      level
      amount
      timestamp
    }
  }
`;

/**
 * Back-compat: old code expected GET_USER_ALL_REWARDS with fields:
 * - goldenStarRewardClaimeds
 * - referralRewardsClaimeds
 * - starRewardClaimeds
 * We alias new entities to those legacy names so existing code compiles.
 */
export const GET_USER_ALL_REWARDS = gql`
  query GetUserAllRewards($user: String!, $first: Int = 100, $skip: Int = 0) {
    goldenStarRewardClaimeds: goldenStarPayouts(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      amount
      timestamp
    }

    referralRewardsClaimeds: referralEarnings(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      level
      amount
      timestamp
    }

    starRewardClaimeds: starRewardPayouts(
      where: { user: $user }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user { id }
      level
      amount
      timestamp
    }
  }
`;

