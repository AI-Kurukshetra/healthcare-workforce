import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import StaffDirectory from "@/modules/staff/components/staff-directory";
import RoleGuard from "@/components/auth/role-guard";
import { getSessionWithRole } from "@/modules/auth/queries";

export default async function StaffPage() {
  const session = await getSessionWithRole();
  const role = session?.role ?? "staff";
  const canManage = role === "admin" || role === "manager";

  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Directory"
          title="Staff"
          description="Profiles, availability, skills, and contact in one place."
          actions={
            canManage ? (
              <div className="flex flex-wrap gap-2">
                <Link href="/staff/skills">
                  <Button variant="outline">Open Skill Matrix</Button>
                </Link>
                <Link href="/credentials">
                  <Button variant="outline">Credential Alerts</Button>
                </Link>
                <Link href="/staff/create">
                  <Button>Add Staff</Button>
                </Link>
              </div>
            ) : null
          }
        />
        <StaffDirectory canManage={canManage} />
      </div>
    </RoleGuard>
  );
}
