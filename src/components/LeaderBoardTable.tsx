import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  CellContext,
} from "@tanstack/react-table";
import React from "react";

export interface User {
  id: string;
  address: string;
  name: string;
  phone: string;
  email: string;
  joinDate: Date;
  stakedVolume: number;
  totalEarnings: number;
  starLevel: number;
  status: "active" | "inactive";
}

interface LeaderBoardTableProps {
  users: User[];
  level: number;
}

type Align = "left" | "right" | "center";
interface ColumnMeta {
  align?: Align;
}

const columns: ColumnDef<User, unknown>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: (info: CellContext<User, unknown>) => String(info.getValue()),
  },
  {
    header: "Address",
    accessorKey: "address",
    cell: (info: CellContext<User, unknown>) =>
      `${(info.getValue() as string).slice(0, 8)}...`,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    cell: (info: CellContext<User, unknown>) => String(info.getValue()),
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: (info: CellContext<User, unknown>) => String(info.getValue()),
  },
  {
    header: "Join Date",
    accessorKey: "joinDate",
    cell: (info: CellContext<User, unknown>) =>
      info.getValue() instanceof Date
        ? (info.getValue() as Date).toLocaleDateString()
        : "-",
  },
  {
    header: "Staked Volume",
    accessorKey: "stakedVolume",
    cell: (info: CellContext<User, unknown>) =>
      `$${Number(info.getValue()).toLocaleString()}`,
    meta: { align: "right" },
  },
  {
    header: "Total Earnings",
    accessorKey: "totalEarnings",
    cell: (info: CellContext<User, unknown>) =>
      `$${Number(info.getValue()).toLocaleString()}`,
    meta: { align: "right" },
  },
  {
    header: "Star Level",
    accessorKey: "starLevel",
    cell: (info: CellContext<User, unknown>) => String(info.getValue()),
    meta: { align: "center" },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (info: CellContext<User, unknown>) => (
      <span
        className={
          info.getValue() === "active"
            ? "text-green-600 dark:text-green-400 font-semibold"
            : "text-gray-400 dark:text-gray-500 font-semibold"
        }
      >
        {info.getValue() as string}
      </span>
    ),
    meta: { align: "center" },
  },
];

const LeaderBoardTable: React.FC<LeaderBoardTableProps> = ({
  users,
  level,
}) => {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
        Users in Level {level}
      </h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-3 py-2 text-gray-700 dark:text-gray-200 ${
                      (header.column.columnDef.meta as ColumnMeta)?.align ===
                      "right"
                        ? "text-right"
                        : (header.column.columnDef.meta as ColumnMeta)
                            ?.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      ) as React.ReactNode
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 text-gray-900 dark:text-white ${
                      (cell.column.columnDef.meta as ColumnMeta)?.align ===
                      "right"
                        ? "text-right"
                        : (cell.column.columnDef.meta as ColumnMeta)?.align ===
                          "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    <React.Fragment>
                      {
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        ) as React.ReactElement | null
                      }
                    </React.Fragment>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoardTable;
