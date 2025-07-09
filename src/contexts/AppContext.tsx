import { createContext } from "react";

import { GET_PACKAGES_CREATED, useGraphQLQuery } from "../graphql";
import { PackageCreated } from "../graphql/types";

interface AppContextType {
  activePackages: PackageCreated[];
  activePackagesCount: number;
  isActivePackagesLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: activePackages, loading: isActivePackagesLoading } =
    useGraphQLQuery<{
      packageCreateds: Array<PackageCreated>;
    }>(GET_PACKAGES_CREATED, {
      variables: {
        where: {
          isActive: true,
        },
      },
    });
  return (
    <AppContext.Provider
      value={{
        activePackages: activePackages?.packageCreateds || [],
        activePackagesCount: activePackages?.packageCreateds?.length || 0,
        isActivePackagesLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
