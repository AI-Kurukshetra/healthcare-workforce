import Link from "next/link";
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
                <Link
                  href="/staff/skills"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Open Skill Matrix
                </Link>
                <Link
                  href="/credentials"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Credential Alerts
                </Link>
                <Link
                  href="/staff/create"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Add Staff
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
