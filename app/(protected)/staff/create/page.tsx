import { listDepartments } from "@/modules/departments/queries";
import StaffForm from "@/modules/staff/components/staff-form";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function CreateStaffPage() {
  const departments = await listDepartments();

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Directory"
        title="Add Staff Member"
        description="Create a new profile and send an invitation."
      />
      <StaffForm departments={departments} />
    </div>
  );
}
