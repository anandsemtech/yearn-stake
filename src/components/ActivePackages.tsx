import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import React from "react";

import { useActivePackagesColumns } from "./ActivePackagesColumns";

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

interface ActivePackagesProps {
  activePackages: Package[];
  onClaimAPR: (packageId: string) => void;
  onUnstake: (packageId: string) => void;
}

const ActivePackages: React.FC<ActivePackagesProps> = ({
  activePackages,
  onClaimAPR,
  onUnstake,
}) => {
  const columns = useActivePackagesColumns({ onClaimAPR, onUnstake });

  const table = useReactTable({
    data: activePackages,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!activePackages || activePackages.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Active Packages
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivePackages;
