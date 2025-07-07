import { Calendar, Lock } from "lucide-react";
import React, { useMemo } from "react";

import { getColorClasses, getTagColor } from "../common/helper";
import { useWallet } from "../contexts/WalletContext";
import {
  GET_PACKAGES_CREATED,
  PackageCreated,
  useGraphQLQuery,
} from "../graphql";

import ActivePackages from "./ActivePackages";

export interface PackageData {
  id: string;
  name: string;
  durationYears: number;
  minAmount: number;
  apy: number;
  color: string;
  tag?: string;
}

interface PackageCardsProps {
  onStakePackage: (packageData: PackageData) => void;
}

const PackageCards: React.FC<PackageCardsProps> = ({ onStakePackage }) => {
  const { user } = useWallet();

  const {
    data: packagesCreated,
    loading: packagesCreatedLoading,
    error: packagesCreatedError,
  } = useGraphQLQuery<{
    packageCreateds: Array<PackageCreated>;
  }>(GET_PACKAGES_CREATED);

  const availablePackages = useMemo(() => {
    if (
      !packagesCreated ||
      packagesCreatedError ||
      !packagesCreated?.packageCreateds
    ) {
      return [];
    }
    return packagesCreated.packageCreateds.map((stake) => {
      return {
        id: stake.internal_id,
        name: `Package ${stake.durationYears}`,
        durationYears: stake.durationYears,
        minAmount: Number(stake.minStakeAmount),
        apy: Number(stake.apr) / 100,
        color: ["blue", "purple", "green", "orange"][
          Math.floor(Math.random() * 4)
        ],
        tag: "Popular",
      };
    });
  }, [packagesCreatedError, packagesCreated]);

  const handleUnstake = async (packageId: string) => {
    // Mock unstake process
    console.log("Unstaking package:", packageId);
  };

  const handleClaimAPR = async (packageId: string) => {
    // Mock claim APR process
    console.log("Claiming APR for package:", packageId);
  };

  return (
    <div className="space-y-8">
      {/* Available Packages */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Available Packages
        </h2>
        {packagesCreatedLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading packages...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                {/* Tag */}
                {pkg.tag && (
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${getTagColor(
                      pkg.tag
                    )}`}
                  >
                    {pkg.tag}
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(
                    pkg.color
                  )} flex items-center justify-center mb-4`}
                >
                  <Calendar className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                  {pkg.name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Duration
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pkg.durationYears}{" "}
                      {pkg.durationYears === 1 ? "Year" : "Years"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Min Amount
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${pkg.minAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      APY
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400 text-lg">
                      {pkg.apy}%
                    </span>
                  </div>
                </div>

                {/* Monthly Returns */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                    Monthly Returns (per $1000)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        APR
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${pkg.apy.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Principal
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ${1000 * pkg.apy}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onStakePackage(pkg)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r ${getColorClasses(
                    pkg.color
                  )} text-white rounded-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 font-semibold`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Stake Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Packages */}
      <ActivePackages
        activePackages={user?.activePackages || []}
        onClaimAPR={handleClaimAPR}
        onUnstake={handleUnstake}
      />
    </div>
  );
};

export default PackageCards;
