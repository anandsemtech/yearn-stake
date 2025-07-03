import { X, DollarSign, Calendar, TrendingUp, Lock } from "lucide-react";
import React, { useEffect, useState } from "react";

import { usePackage } from "../web3/ReadContract";
import { useApproveAndProcess } from "../web3/WriteContract/useApproveAndProcess";

interface StakingModalProps {
  package: any;
  onClose: () => void;
}

const StakingModal: React.FC<StakingModalProps> = ({
  package: pkg,
  onClose,
}) => {
  const [amount, setAmount] = useState(pkg.minAmount.toString());
  const [referrer] = useState(() => {
    const referrer = localStorage.getItem("yearn_together_referral");
    if (!referrer) {
      return "0x0000000000000000000000000000000000000000";
    }
    return JSON.parse(referrer);
  });

  const { data: packageData } = usePackage(Number(pkg.id));

  const { stake, isStakePending, isStakeSuccess } = useApproveAndProcess();

  useEffect(() => {
    if (isStakeSuccess) {
      onClose();
    }
  }, [isStakeSuccess, onClose]);

  const handleStake = async () => {
    stake({
      packageId: Number(pkg.id),
      amounts: [amount],
      referrer: referrer.referrerAddress,
    });
  };

  useEffect(() => {
    setAmount(packageData?.minStakeAmount.toString() ?? "0");
  }, [packageData?.minStakeAmount]);

  const projectedEarnings =
    amount > 0 ? (parseFloat(amount) * pkg.apy) / 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Stake {pkg.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Duration
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {packageData?.durationYears}{" "}
                  {packageData?.durationYears === 1 ? "Year" : "Years"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">APY</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {packageData?.apr}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stake Amount (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={packageData?.minStakeAmount}
                step="100"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum amount: ${packageData?.minStakeAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Projected Annual Earnings
            </h3>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${projectedEarnings.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on {pkg.apy}% APY
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={isStakePending}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={
                isStakePending ||
                parseFloat(amount) < (packageData?.minStakeAmount ?? 0)
              }
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {isStakePending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{isStakePending ? "Staking..." : "Stake Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingModal;
