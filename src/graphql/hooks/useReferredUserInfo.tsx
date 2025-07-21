import { useMemo, useState } from "react";
import { Address, formatEther } from "viem";
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
      const userAddress = staked.user as `0x${string}`;
      if (stakedUsersWithAddedInfo[userAddress]) {
        // If user exists, add the staked amount
        stakedUsersWithAddedInfo[userAddress] = {
          ...stakedUsersWithAddedInfo[userAddress],
          amount:
            Number(
              formatEther(
                stakedUsersWithAddedInfo[userAddress]
                  .amount as unknown as bigint
              )
            ) +
            Number(formatEther(staked.amount as unknown as bigint)).toString(),
          blockTimestamp: stakedUsersWithAddedInfo[userAddress].blockTimestamp,
        };
      } else {
        // If new user, create entry
        stakedUsersWithAddedInfo[userAddress] = {
          ...staked,
          starLevel: (await publicClient?.readContract({
            ...baseContractConfig(chainId as number),
            functionName: "userStarLevel",
            args: [staked.user as Address],
          })) as number,
        };
      }
    });
    setIsLoading(false);
    return stakedUsersWithAddedInfo;
  }, [stakedData, isStakedLoading, chainId, publicClient]);

  return {
    stakedUsersWithAddedInfo,
    totalStakedVolume: stakedData?.stakeds.reduce(
      (acc, staked) => acc + Number(staked.amount),
      0
    ),
    isLoading: isStakedLoading || isLoading,
    stakedError,
  };
};
