"use client";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StaffListItem } from "../types";
import { Button } from "@/components/ui/button";
import { Eye, Edit, UserX } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StaffTableProps {
  data: StaffListItem[];
}

export default function StaffTable({ data }: StaffTableProps) {
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const columns: ColumnDef<StaffListItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.original.name}</span>
          <span className="text-xs text-slate-500">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              role === "admin"
                ? "bg-rose-100 text-rose-700"
                : role === "manager"
                ? "bg-amber-100 text-amber-700"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {role}
          </span>
        );
      },
      enableGlobalFilter: true, // Allow role search
    },
    {
      accessorKey: "title",
      header: "Employment Type",
      cell: ({ row }) => <span className="text-slate-700">{row.getValue("title") || "N/A"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: () => (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
          Active
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/staff/${row.original.id}`}>
            <Button variant="outline" className="h-8 w-8 p-0" title="View Profile">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/staff/edit/${row.original.id}`}>
            <Button variant="outline" className="h-8 w-8 p-0" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            title="Deactivate"
            onClick={() => setDeactivateId(row.original.id)}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search staff by name, email, or role..."
      />
      <ConfirmDialog
        open={!!deactivateId}
        onCancel={() => setDeactivateId(null)}
        title="Deactivate Staff"
        message="Are you sure you want to deactivate this staff member? Their access will be revoked but historical records will be preserved."
        onConfirm={async () => {
          // TODO: implement deactivation
          setDeactivateId(null);
        }}
        variant="danger"
        confirmLabel="Deactivate"
      />
    </>
  );
}
