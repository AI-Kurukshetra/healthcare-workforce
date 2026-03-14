import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionWithRole } from "@/modules/auth/queries";

type Role = "admin" | "manager" | "staff";

const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  staff: "/dashboard/staff",
};

export default async function RoleGuard({
  roles,
  children,
  redirectOnDeny = true,
}: {
  roles: Role[];
  children: ReactNode;
  redirectOnDeny?: boolean;
}) {
  const result = await getSessionWithRole();

  if (!result?.session) {
    redirect("/signin");
  }

  const role = (result?.role as Role | undefined) ?? "staff";

  if (!roles.includes(role)) {
    if (redirectOnDeny) redirect(ROLE_HOME[role]);
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Access denied for your role.
      </div>
    );
  }

  return <>{children}</>;
}
