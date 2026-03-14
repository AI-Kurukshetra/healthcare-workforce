import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TimeOffForm from "@/modules/timeoff/components/timeoff-form";
import TimeOffTable from "@/modules/timeoff/components/timeoff-table";
import RoleGuard from "@/components/auth/role-guard";

export default function MyTimeOffPage() {
  return (
    <RoleGuard roles={["staff"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Leave"
          title="My Time Off"
          description="Submit and track your time off requests."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New Request</CardTitle>
              <CardDescription>Submit PTO, sick, or training leave.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Status of your submissions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffTable scope="self" />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
