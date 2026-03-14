import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TimeOffForm from "@/modules/timeoff/components/timeoff-form";
import TimeOffTable from "@/modules/timeoff/components/timeoff-table";
import PendingApprovals from "@/modules/timeoff/components/pending-approvals";

export default function TimeOffPage() {
  return (
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
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Status of your submissions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <TimeOffTable />
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
  );
}
