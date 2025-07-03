import {
  Calendar,
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
  Zap,
  Clock,
} from "lucide-react";
import React, { useMemo } from "react";

import { getColorClasses, getTagColor } from "../common/helper";
import { useWallet } from "../contexts/WalletContext";
import {
  GET_PACKAGES_CREATED,
  PackageCreated,
  useGraphQLQuery,
} from "../graphql";

interface PackageCardsProps {
  onStakePackage: (packageData: any) => void;
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
    )
      return [];
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

  const getNextClaimDate = (startDate: Date) => {
    const nextClaim = new Date(startDate);
    nextClaim.setMonth(nextClaim.getMonth() + 1);
    return nextClaim;
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
      {user?.activePackages && user.activePackages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Active Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.activePackages.map((pkg) => {
              const nextClaimDate = getNextClaimDate(pkg.startDate);
              const canClaim = nextClaimDate <= new Date();
              const monthlyAPR = (pkg.amount * pkg.apy) / 100 / 12;
              const monthlyPrincipal = pkg.amount / (pkg.duration * 12);

              return (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                        {pkg.status}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Staked Amount
                        </span>
                      </div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${pkg.amount.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          APY
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {pkg.apy}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monthly APR
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${monthlyAPR.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monthly Unstake Principal
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        ${monthlyPrincipal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        End Date
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pkg.endDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Next Claim
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span
                          className={`font-medium ${
                            canClaim
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {canClaim
                            ? "Available now"
                            : nextClaimDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleClaimAPR(pkg.id)}
                      disabled={!canClaim}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-medium ${
                        canClaim
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>
                        {canClaim
                          ? `Claim $${monthlyAPR.toFixed(2)}`
                          : "Claim APR"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleUnstake(pkg.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Unstake</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCards;
