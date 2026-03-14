"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { StaffListItem } from "../types";
import { Button } from "@/components/ui/button";
import { Eye, Edit, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setStaffActiveStatus } from "../actions";

interface StaffTableProps {
  data: StaffListItem[];
  canManage: boolean;
}

export default function StaffTable({ data, canManage }: StaffTableProps) {
  const router = useRouter();
  const [selectedStaff, setSelectedStaff] = useState<StaffListItem | null>(null);

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
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
            Inactive
          </span>
        ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: StaffListItem } }) => (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-700 hover:text-slate-900"
                  title="View Profile"
                  onClick={() => router.push(`/staff/${row.original.id}`)}
                >
                  <Eye className="h-4 w-4 shrink-0" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-700 hover:text-slate-900"
                  title="Edit"
                  onClick={() => router.push(`/staff/edit/${row.original.id}`)}
                >
                  <Edit className="h-4 w-4 shrink-0" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 shrink-0 ${
                    row.original.isActive
                      ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                  title={row.original.isActive ? "Deactivate" : "Reactivate"}
                  onClick={() => setSelectedStaff(row.original)}
                >
                  {row.original.isActive ? (
                    <UserX className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <UserCheck className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </Button>
              </div>
            ),
          } satisfies ColumnDef<StaffListItem>,
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        columns={columns.filter(Boolean) as ColumnDef<StaffListItem>[]}
        data={data}
        searchPlaceholder="Search staff by name, email, or role..."
      />
      <ConfirmDialog
        open={!!selectedStaff}
        onCancel={() => setSelectedStaff(null)}
        title={selectedStaff?.isActive ? "Deactivate Staff" : "Reactivate Staff"}
        message={
          selectedStaff?.isActive
            ? "Are you sure you want to deactivate this staff member? Their access will be revoked but historical records will be preserved."
            : "Are you sure you want to reactivate this staff member? They will be able to access the system again."
        }
        onConfirm={async () => {
          if (!selectedStaff) return;

          try {
            await setStaffActiveStatus(selectedStaff.id, !selectedStaff.isActive);
            toast.success(selectedStaff.isActive ? "Staff member deactivated" : "Staff member reactivated");
            setSelectedStaff(null);
            router.refresh();
          } catch (error: any) {
            toast.error(error.message || "Failed to update staff access");
          }
        }}
        variant={selectedStaff?.isActive ? "danger" : "default"}
        confirmLabel={selectedStaff?.isActive ? "Deactivate" : "Reactivate"}
      />
    </>
  );
}
