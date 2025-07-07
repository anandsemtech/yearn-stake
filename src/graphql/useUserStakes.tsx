import { useEffect, useState } from "react";
import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";

import { GET_PACKAGES_CREATED, PackageCreated, UserStake } from "./queries";

import { GET_USER_STAKES, useGraphQLQuery } from ".";

export interface PackageList {
  totalStaked: number;
  id: string;
  user: string;
  packageId: string;
  amount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  internal_id?: string;
  durationYears?: number;
  apr?: number;
  isActive?: boolean;
  monthlyUnstake?: boolean;
}

export const useUserStakes = () => {
  const { address } = useAccount();
  const [packageList, setPackageList] = useState<PackageList[]>([]);

  const { data: userStakes, loading: isUserStakesLoading } = useGraphQLQuery<{
    stakeds: Array<UserStake>;
  }>(GET_USER_STAKES, {
    variables: {
      user: address as Address,
    },
    skip: !address,
  });

  const { data: packageDetails, loading: isPackageDetailsLoading } =
    useGraphQLQuery<{
      packageCreateds: Array<PackageCreated>;
    }>(GET_PACKAGES_CREATED, {
      variables: {
        where: {
          internal_id_in: userStakes?.stakeds.map((stake) => stake.packageId),
        },
      },
      skip: !userStakes?.stakeds.length,
    });

  useEffect(() => {
    if (packageDetails && userStakes?.stakeds.length) {
      const packageList = userStakes?.stakeds.map((stake) => {
        const pkg = packageDetails.packageCreateds.find(
          (p) => Number(p.internal_id) === Number(stake.packageId)
        );
        return {
          ...pkg,
          ...stake,
          apr: pkg?.apr ? pkg.apr / 100 : 0,
          totalStaked: stake.amount
            ? Number(formatEther(stake.amount as unknown as bigint))
            : 0,
        };
      });
      setPackageList(packageList || []);
    }
  }, [packageDetails, userStakes?.stakeds]);

  return {
    userStakes,
    packageList,
    isLoading: isUserStakesLoading || isPackageDetailsLoading,
  };
};
