import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ClockWidget from "@/modules/time-tracking/components/clock-widget";
import TimeEntryTable from "@/modules/time-tracking/components/time-entry-table";

export const dynamic = "force-dynamic";

export default function TimeTrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Attendance"
        title="Time Tracking"
        description="Clock in/out, review time entries, and monitor overtime."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Clock In / Out</CardTitle>
            <CardDescription>Tap to start or end your session.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ClockWidget />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
            <CardDescription>Your recent clock-in/out records.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <TimeEntryTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
