import { useMemo, useState } from "react";
import { Address } from "viem";
import { useChainId, usePublicClient } from "wagmi";

import { baseContractConfig } from "../../web3/contract";
import { useGraphQLQuery } from "../hooks";
import { GET_MULTIPLE_USER_STAKES } from "../queries";
import { UserStake } from "../types";

export const useReferredUserInfo = (users: Address[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const {
    data: stakedData,
    loading: isStakedLoading,
    error: stakedError,
  } = useGraphQLQuery<{
    stakeds: Array<UserStake>;
  }>(GET_MULTIPLE_USER_STAKES, {
    variables: {
      users,
    },
  });

  const stakedUsersWithAddedInfo = useMemo(() => {
    if (!stakedData || isStakedLoading || !chainId || !publicClient) return {};
    setIsLoading(true);
    const stakedUsersWithAddedInfo: Record<
      Address,
      UserStake & { starLevel: number }
    > = {} as Record<`0x${string}`, UserStake & { starLevel: number }>;
    stakedData?.stakeds.forEach(async (staked) => {
      stakedUsersWithAddedInfo[staked.user as `0x${string}`] = {
        ...staked,
        starLevel: (await publicClient?.readContract({
          ...baseContractConfig(chainId as number),
          functionName: "userStarLevel",
          args: [staked.user as Address],
        })) as number,
      };
    });
    setIsLoading(false);
    return stakedUsersWithAddedInfo;
  }, [stakedData, isStakedLoading, chainId, publicClient]);

  return {
    stakedUsersWithAddedInfo,
    isLoading: isStakedLoading || isLoading,
    stakedError,
  };
};
