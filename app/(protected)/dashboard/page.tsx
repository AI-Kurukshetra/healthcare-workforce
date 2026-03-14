import { redirect } from "next/navigation";
import { getSessionWithRole } from "@/modules/auth/queries";

const ROLE_HOME: Record<"admin" | "manager" | "staff", string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  staff: "/dashboard/staff",
};

export default async function DashboardIndex() {
  const session = await getSessionWithRole();
  if (!session) redirect("/signin");
  const roleKey = (session.role ?? "staff") as keyof typeof ROLE_HOME;
  redirect(ROLE_HOME[roleKey] ?? ROLE_HOME.staff);
}
