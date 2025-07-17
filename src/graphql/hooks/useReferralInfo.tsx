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

interface UseReferralInfoReturn {
  // Data by level
  level1: ReferralLevel;
  level2: ReferralLevel;
  level3: ReferralLevel;
  level4: ReferralLevel;
  level5: ReferralLevel;

  // Loading states
  isLoading: boolean;
  isLevel1Loading: boolean;
  isLevel2Loading: boolean;
  isLevel3Loading: boolean;
  isLevel4Loading: boolean;
  isLevel5Loading: boolean;

  // Error states
  error: unknown;
  level1Error: unknown;
  level2Error: unknown;
  level3Error: unknown;
  level4Error: unknown;
  level5Error: unknown;

  // Computed totals
  totalReferrals: number;
  totalUsers: number;

  // Helper functions
  getReferralsByLevel: (level: 1 | 2 | 3 | 4 | 5) => ReferralLevel;
  getUsersByLevel: (level: 1 | 2 | 3 | 4 | 5) => string[];
}

export const useReferralInfo = (): UseReferralInfoReturn => {
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

  // Memoized computed values
  const computedData = useMemo(() => {
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
    };
  }, [level1Data, level2Data, level3Data, level4Data, level5Data]);

  // Helper functions
  const getReferralsByLevel = (level: 1 | 2 | 3 | 4 | 5): ReferralLevel => {
    const levels = [
      computedData.level1,
      computedData.level2,
      computedData.level3,
      computedData.level4,
      computedData.level5,
    ];
    return levels[level - 1];
  };

  const getUsersByLevel = (level: 1 | 2 | 3 | 4 | 5): string[] => {
    return getReferralsByLevel(level).users;
  };

  return {
    // Data by level
    level1: computedData.level1,
    level2: computedData.level2,
    level3: computedData.level3,
    level4: computedData.level4,
    level5: computedData.level5,

    // Loading states
    isLoading:
      isLevel1Loading ||
      isLevel2Loading ||
      isLevel3Loading ||
      isLevel4Loading ||
      isLevel5Loading,
    isLevel1Loading,
    isLevel2Loading,
    isLevel3Loading,
    isLevel4Loading,
    isLevel5Loading,

    // Error states
    error:
      level1Error || level2Error || level3Error || level4Error || level5Error,
    level1Error,
    level2Error,
    level3Error,
    level4Error,
    level5Error,

    // Computed totals
    totalReferrals: computedData.totalReferrals,
    totalUsers: computedData.totalUsers,

    // Helper functions
    getReferralsByLevel,
    getUsersByLevel,
  };
};
