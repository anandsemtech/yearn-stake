import { createContext } from "react";

import { GET_PACKAGES_CREATED, useGraphQLQuery } from "../graphql";
import { Package } from "@/graphql/__generated__/types";

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
      packages: Array<Package>;
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
        activePackages: activePackages?.packages || [],
        activePackagesCount: activePackages?.packages?.length || 0,
        isActivePackagesLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
