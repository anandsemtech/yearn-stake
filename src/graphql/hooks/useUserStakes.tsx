import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

import { useGraphQLQuery } from "../hooks";
import { GET_PACKAGES_CREATED, GET_USER_STAKES } from "../queries";
import { PackageCreated, UserStake } from "../types";

export interface PackageList extends PackageCreated, UserStake {
  totalStaked: number;
}

export const useUserStakes = () => {
  const { address } = useAccount();
  const [packageList, setPackageList] = useState<PackageList[]>([]);

  const { data: userStakes, loading: isUserStakesLoading } = useGraphQLQuery<{
    stakeds: Array<UserStake>;
  }>(GET_USER_STAKES, {
    variables: {
      user: address as Address,
      orderBy: "blockTimestamp",
      orderDirection: "desc",
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
      const packageList = userStakes?.stakeds
        .map((stake) => {
          const pkg = packageDetails.packageCreateds.find(
            (p) => Number(p.internal_id) === Number(stake.packageId)
          );
          if (!pkg) return null;
          return {
            ...pkg,
            ...stake,
            apr: pkg.apr ? pkg.apr / 100 : 0,
            totalStaked: Number(stake.amount),
          };
        })
        .filter((item): item is PackageList => item !== null);
      setPackageList(packageList);
    }
  }, [packageDetails, userStakes?.stakeds]);

  return {
    userStakes,
    packageList,
    isLoading: isUserStakesLoading || isPackageDetailsLoading,
  };
};
