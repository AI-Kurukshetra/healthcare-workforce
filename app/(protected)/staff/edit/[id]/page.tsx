import { listDepartments } from "@/modules/departments/queries";
import { getStaffById } from "@/modules/staff/queries";
import StaffForm from "@/modules/staff/components/staff-form";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";
import RoleGuard from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const [departments, staffUser] = await Promise.all([
    listDepartments(),
    getStaffById(params.id),
  ]);

  if (!staffUser) {
    notFound();
  }

  return (
    <RoleGuard roles={["admin"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Directory"
          title="Edit Staff Member"
          description="Update staff profile and assignments."
        />
        <StaffForm departments={departments} initialData={staffUser} />
      </div>
    </RoleGuard>
  );
}
