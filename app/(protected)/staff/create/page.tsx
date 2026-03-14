import { listDepartments } from "@/modules/departments/queries";
import StaffForm from "@/modules/staff/components/staff-form";
import { listRegisteredUserOptions } from "@/modules/staff/queries";
import { PageHeader } from "@/components/ui/page-header";
import RoleGuard from "@/components/auth/role-guard";
import { getSessionWithRole } from "@/modules/auth/queries";

export const dynamic = "force-dynamic";

export default async function CreateStaffPage() {
  const ctx = await getSessionWithRole();
  const role = ctx?.role ?? "staff";
  const allowedRoles: ("admin" | "manager" | "staff")[] =
    role === "manager" ? ["staff"] : ["staff", "manager", "admin"];
  const defaultDepartmentId = role === "manager" ? ctx?.departmentId ?? "" : "";

  const [departments, registeredUsers] = await Promise.all([
    listDepartments(),
    role === "admin" ? listRegisteredUserOptions() : Promise.resolve([]),
  ]);

  if (role === "manager" && !defaultDepartmentId) {
    return (
      <RoleGuard roles={["manager"]} redirectOnDeny={false}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your profile is not linked to a department. Ask an admin to assign your department before creating staff.
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Directory"
          title="Add Staff Member"
          description="Create a new profile and send an invitation."
        />
        <StaffForm
          departments={departments}
          allowedRoles={allowedRoles}
          defaultDepartmentId={defaultDepartmentId}
          lockDepartment={role === "manager"}
          availableProfiles={registeredUsers}
          requireExistingProfile={role === "admin"}
        />
      </div>
    </RoleGuard>
  );
}
