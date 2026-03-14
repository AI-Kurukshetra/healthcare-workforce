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
  redirect(ROLE_HOME[(session.role as any) ?? "staff"]);
}
