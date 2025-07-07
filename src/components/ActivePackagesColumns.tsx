import { createColumnHelper } from "@tanstack/react-table";
import { DollarSign, TrendingUp, Unlock, Zap, Clock } from "lucide-react";

interface Package {
  id: string;
  name: string;
  duration: number;
  amount: number;
  apy: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "inactive";
}

interface ActivePackagesColumnsProps {
  onClaimAPR: (packageId: string) => void;
  onUnstake: (packageId: string) => void;
}

const columnHelper = createColumnHelper<Package>();

export const useActivePackagesColumns = ({
  onClaimAPR,
  onUnstake,
}: ActivePackagesColumnsProps) => {
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
            ${getValue().toLocaleString()}
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
      cell: ({ getValue, row }) => {
        const nextClaimDate = getNextClaimDate(row.original.startDate);
        const canClaim = nextClaimDate <= new Date();
        const monthlyAPR = (row.original.amount * row.original.apy) / 100 / 12;

        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onClaimAPR(getValue())}
              disabled={!canClaim}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-sm font-medium ${
                canClaim
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>
                {canClaim ? `Claim $${monthlyAPR.toFixed(2)}` : "Claim APR"}
              </span>
            </button>

            <button
              onClick={() => onUnstake(getValue())}
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium"
            >
              <Unlock className="w-3 h-3" />
              <span>Unstake</span>
            </button>
          </div>
        );
      },
    }),
  ];
};
