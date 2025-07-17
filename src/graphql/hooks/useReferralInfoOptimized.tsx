import { useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

import { useGraphQLQuery } from "../hooks";
import { GET_REFERRER_ASSIGNMENTS } from "../queries";
import { ReferralAssigned } from "../types";

interface ReferralLevel {
  referrals: ReferralAssigned[];
  count: number;
  users: string[];
}

interface UseReferralInfoOptimizedReturn {
  // Data by level
  level1: ReferralLevel;
  level2: ReferralLevel;
  level3: ReferralLevel;
  level4: ReferralLevel;
  level5: ReferralLevel;

  // Loading and error states
  isLoading: boolean;
  error: unknown;

  // Computed totals
  totalReferrals: number;
  totalUsers: number;

  // Helper functions
  getReferralsByLevel: (level: 1 | 2 | 3 | 4 | 5) => ReferralLevel;
  getUsersByLevel: (level: 1 | 2 | 3 | 4 | 5) => string[];
  getReferralTree: () => Map<string, string[]>; // user -> their referrals
}

/**
 * Optimized referral info hook that fetches referrals level by level
 * with proper dependency chaining and performance optimizations
 */
export const useReferralInfoOptimized = (): UseReferralInfoOptimizedReturn => {
  const { address } = useAccount();

  // Level 1 referrals (direct referrals)
  const {
    data: level1Data,
    loading: isLevel1Loading,
    error: level1Error,
  } = useGraphQLQuery<{
    referralAssigneds: Array<ReferralAssigned>;
  }>(GET_REFERRER_ASSIGNMENTS, {
    variables: {
      referrer: address as Address,
    },
    skip: !address,
  });

  // Level 2 referrals (referrals of level 1 users)
  const {
    data: level2Data,
    loading: isLevel2Loading,
    error: level2Error,
  } = useGraphQLQuery<{
    referralAssigneds: Array<ReferralAssigned>;
  }>(GET_REFERRER_ASSIGNMENTS, {
    variables: {
      referrer_in: level1Data?.referralAssigneds.map(
        (referral) => referral.user
      ) as Address[],
    },
    skip:
      !level1Data?.referralAssigneds.length || isLevel1Loading || !!level1Error,
  });

  // Level 3 referrals (referrals of level 2 users)
  const {
    data: level3Data,
    loading: isLevel3Loading,
    error: level3Error,
  } = useGraphQLQuery<{
    referralAssigneds: Array<ReferralAssigned>;
  }>(GET_REFERRER_ASSIGNMENTS, {
    variables: {
      referrer_in: level2Data?.referralAssigneds.map(
        (referral) => referral.user
      ) as Address[],
    },
    skip:
      !level2Data?.referralAssigneds.length || isLevel2Loading || !!level2Error,
  });

  // Level 4 referrals (referrals of level 3 users)
  const {
    data: level4Data,
    loading: isLevel4Loading,
    error: level4Error,
  } = useGraphQLQuery<{
    referralAssigneds: Array<ReferralAssigned>;
  }>(GET_REFERRER_ASSIGNMENTS, {
    variables: {
      referrer_in: level3Data?.referralAssigneds.map(
        (referral) => referral.user
      ) as Address[],
    },
    skip:
      !level3Data?.referralAssigneds.length || isLevel3Loading || !!level3Error,
  });

  // Level 5 referrals (referrals of level 4 users)
  const {
    data: level5Data,
    loading: isLevel5Loading,
    error: level5Error,
  } = useGraphQLQuery<{
    referralAssigneds: Array<ReferralAssigned>;
  }>(GET_REFERRER_ASSIGNMENTS, {
    variables: {
      referrer_in: level4Data?.referralAssigneds.map(
        (referral) => referral.user
      ) as Address[],
    },
    skip:
      !level4Data?.referralAssigneds.length || isLevel4Loading || !!level4Error,
  });

  // Process the data to build the referral tree and compute levels
  const processedData = useMemo(() => {
    const level1: ReferralLevel = {
      referrals: level1Data?.referralAssigneds || [],
      count: level1Data?.referralAssigneds.length || 0,
      users: level1Data?.referralAssigneds.map((r) => r.user) || [],
    };

    const level2: ReferralLevel = {
      referrals: level2Data?.referralAssigneds || [],
      count: level2Data?.referralAssigneds.length || 0,
      users: level2Data?.referralAssigneds.map((r) => r.user) || [],
    };

    const level3: ReferralLevel = {
      referrals: level3Data?.referralAssigneds || [],
      count: level3Data?.referralAssigneds.length || 0,
      users: level3Data?.referralAssigneds.map((r) => r.user) || [],
    };

    const level4: ReferralLevel = {
      referrals: level4Data?.referralAssigneds || [],
      count: level4Data?.referralAssigneds.length || 0,
      users: level4Data?.referralAssigneds.map((r) => r.user) || [],
    };

    const level5: ReferralLevel = {
      referrals: level5Data?.referralAssigneds || [],
      count: level5Data?.referralAssigneds.length || 0,
      users: level5Data?.referralAssigneds.map((r) => r.user) || [],
    };

    // Build referral tree for helper functions
    const referralTree = new Map<string, string[]>();

    // Add level 1 referrals
    level1.referrals.forEach((referral) => {
      if (!referralTree.has(referral.referrer)) {
        referralTree.set(referral.referrer, []);
      }
      referralTree.get(referral.referrer)!.push(referral.user);
    });

    // Add level 2-5 referrals
    [level2, level3, level4, level5].forEach((level) => {
      level.referrals.forEach((referral) => {
        if (!referralTree.has(referral.referrer)) {
          referralTree.set(referral.referrer, []);
        }
        referralTree.get(referral.referrer)!.push(referral.user);
      });
    });

    const totalReferrals =
      level1.count + level2.count + level3.count + level4.count + level5.count;
    const totalUsers = new Set([
      ...level1.users,
      ...level2.users,
      ...level3.users,
      ...level4.users,
      ...level5.users,
    ]).size;

    return {
      level1,
      level2,
      level3,
      level4,
      level5,
      totalReferrals,
      totalUsers,
      referralTree,
    };
  }, [level1Data, level2Data, level3Data, level4Data, level5Data]);

  // Helper functions
  const getReferralsByLevel = (level: 1 | 2 | 3 | 4 | 5): ReferralLevel => {
    const levels = [
      processedData.level1,
      processedData.level2,
      processedData.level3,
      processedData.level4,
      processedData.level5,
    ];
    return levels[level - 1];
  };

  const getUsersByLevel = (level: 1 | 2 | 3 | 4 | 5): string[] => {
    return getReferralsByLevel(level).users;
  };

  const getReferralTree = () => {
    return processedData.referralTree;
  };

  return {
    // Data by level
    level1: processedData.level1,
    level2: processedData.level2,
    level3: processedData.level3,
    level4: processedData.level4,
    level5: processedData.level5,

    // Loading and error states
    isLoading:
      isLevel1Loading ||
      isLevel2Loading ||
      isLevel3Loading ||
      isLevel4Loading ||
      isLevel5Loading,
    error:
      level1Error || level2Error || level3Error || level4Error || level5Error,

    // Computed totals
    totalReferrals: processedData.totalReferrals,
    totalUsers: processedData.totalUsers,

    // Helper functions
    getReferralsByLevel,
    getUsersByLevel,
    getReferralTree,
  };
};
