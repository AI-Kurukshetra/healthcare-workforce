import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ClockWidget from "@/modules/time-tracking/components/clock-widget";
import TimeEntryTable from "@/modules/time-tracking/components/time-entry-table";
import { getSessionWithRole } from "@/modules/auth/queries";

export const dynamic = "force-dynamic";

export default async function TimeTrackingPage() {
  const session = await getSessionWithRole();
  const role = session?.role ?? "staff";
  const scope = (role === "admin" ? "all" : role === "manager" ? "team" : "self") as
    | "all"
    | "team"
    | "self";

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Attendance"
        title="Time Tracking"
        description={
          role === "manager"
            ? "Review your team's time entries."
            : role === "admin"
            ? "Organization-wide time entry visibility."
            : "Clock in/out and review your entries."
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {role === "staff" ? (
          <Card>
            <CardHeader>
              <CardTitle>Clock In / Out</CardTitle>
              <CardDescription>Tap to start or end your session.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ClockWidget />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Clocking</CardTitle>
              <CardDescription>Clocking is limited to staff accounts.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 text-sm text-slate-600">
              Managers and admins can review entries below. Staff members perform clock actions from their account.
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
            <CardDescription>
              {role === "admin" ? "All entries" : role === "manager" ? "Team entries" : "Your recent records"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <TimeEntryTable scope={scope} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
