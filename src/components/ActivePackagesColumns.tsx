import { createColumnHelper } from "@tanstack/react-table";
import { DollarSign, TrendingUp, Unlock, Zap, Clock } from "lucide-react";
import { formatEther } from "viem";

import { ActivePackage } from "../contexts/WalletContext";
import {
  useClaimAPR,
  useUnstake,
} from "../web3/WriteContract/useYearnTogetherWrite";

const columnHelper = createColumnHelper<ActivePackage>();

export const useActivePackagesColumns = () => {
  const { claimAPR, isPending } = useClaimAPR();
  const { unstake, isPending: isUnstakePending } = useUnstake();
  const getNextClaimDate = (startDate: Date) => {
    const nextClaim = new Date(startDate);
    nextClaim.setMonth(nextClaim.getMonth() + 1);
    return nextClaim;
  };

  return [
    columnHelper.accessor("duration", {
      header: "Package Name",
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.original.duration} Year Package
        </div>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            ${formatEther(getValue() as unknown as bigint)}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("apy", {
      header: "APR",
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {getValue()}%
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("startDate", {
      header: "Start Date",
      cell: ({ getValue }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {getValue().toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor("startDate", {
      id: "nextClaim",
      header: "Next Claim",
      cell: ({ getValue }) => {
        const nextClaimDate = getNextClaimDate(getValue());
        const canClaim = nextClaimDate <= new Date();

        return (
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span
              className={`font-medium ${
                canClaim
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {canClaim ? "Available now" : nextClaimDate.toLocaleDateString()}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
            {getValue()}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      ),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: ({ row }) => {
        const nextClaimDate = getNextClaimDate(row.original.startDate);
        const canClaim = nextClaimDate <= new Date();
        const monthlyAPR = (row.original.amount * row.original.apy) / 100 / 12;

        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => claimAPR(Number(row.original.stakeIndex))}
              disabled={isPending}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium ${
                canClaim
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>
                {isPending ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Claiming...
                  </span>
                ) : canClaim ? (
                  `Claim $${monthlyAPR.toFixed(2)}`
                ) : (
                  "Claim APR"
                )}
              </span>
            </button>

            <button
              onClick={() => unstake(Number(row.original.stakeIndex))}
              disabled={isUnstakePending}
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium"
            >
              <Unlock className="w-3 h-3" />
              <span>
                {isUnstakePending ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Unstaking...
                  </span>
                ) : (
                  "Unstake"
                )}
              </span>
            </button>
          </div>
        );
      },
    }),
  ];
};
