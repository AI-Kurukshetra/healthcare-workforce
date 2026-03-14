import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TimeOffForm from "@/modules/timeoff/components/timeoff-form";
import TimeOffTable from "@/modules/timeoff/components/timeoff-table";
import PendingApprovals from "@/modules/timeoff/components/pending-approvals";
import RoleGuard from "@/components/auth/role-guard";
import { getSessionWithRole } from "@/modules/auth/queries";

export default async function TimeOffPage() {
  const session = await getSessionWithRole();
  const role = session?.role ?? "staff";
  const scope = (role === "admin" ? "all" : "team") as "all" | "team";

  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Leave management"
          title="Time Off"
          description="Request time off, track approvals, and review pending requests."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New Request</CardTitle>
              <CardDescription>Submit a vacation, sick, or unpaid leave request.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
              <CardDescription>{role === "admin" ? "All requests" : "Team requests"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffTable scope={scope} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Requests awaiting manager review.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <PendingApprovals />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
