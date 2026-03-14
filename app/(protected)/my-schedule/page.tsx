import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScheduleCalendar from "@/modules/schedules/components/schedule-calendar";
import RoleGuard from "@/components/auth/role-guard";

export default function MySchedulePage() {
  return (
    <RoleGuard roles={["staff"]}>
      <div className="space-y-6">
        <PageHeader
          badge="My shifts"
          title="My Schedule"
          description="View assigned shifts and open slots. Editing is restricted to managers."
        />

        <Card>
          <CardHeader>
            <CardTitle>Weekly Calendar</CardTitle>
            <CardDescription>Read-only view of your schedule.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ScheduleCalendar scope="self" />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
