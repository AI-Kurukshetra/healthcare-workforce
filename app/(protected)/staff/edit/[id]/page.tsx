import { listDepartments } from "@/modules/departments/queries";
import { getStaffById } from "@/modules/staff/queries";
import StaffForm from "@/modules/staff/components/staff-form";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";
import RoleGuard from "@/components/auth/role-guard";
import { getSessionWithRole } from "@/modules/auth/queries";

export const dynamic = "force-dynamic";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const ctx = await getSessionWithRole();
  const [departments, staffUser] = await Promise.all([listDepartments(), getStaffById(params.id)]);

  if (!staffUser) {
    notFound();
  }

  const role = ctx?.role ?? "staff";
  const managerDept = ctx?.departmentId ?? null;
  if (role === "manager" && managerDept && staffUser.departmentId && staffUser.departmentId !== managerDept) {
    return (
      <RoleGuard roles={["manager"]} redirectOnDeny={false}>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          You can only edit staff in your department.
        </div>
      </RoleGuard>
    );
  }

  const allowedRoles: ("admin" | "manager" | "staff")[] =
    role === "manager" ? ["staff"] : ["staff", "manager", "admin"];
  const lockDepartment = role === "manager";
  const defaultDepartmentId = lockDepartment ? managerDept ?? "" : staffUser.departmentId ?? "";

  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Directory"
          title="Edit Staff Member"
          description="Update staff profile and assignments."
        />
        <StaffForm
          departments={departments}
          initialData={staffUser}
          allowedRoles={allowedRoles}
          defaultDepartmentId={defaultDepartmentId}
          lockDepartment={lockDepartment}
        />
      </div>
    </RoleGuard>
  );
}
