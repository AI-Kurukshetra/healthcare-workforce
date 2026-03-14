import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import UnitSchedule from "@/modules/schedules/components/unit-schedule";
import ClockWidget from "@/modules/time-tracking/components/clock-widget";
import TimeOffForm from "@/modules/timeoff/components/timeoff-form";
import TimeOffTable from "@/modules/timeoff/components/timeoff-table";
import SwapRequestsTable from "@/modules/shift-swaps/components/swap-requests-table";
import RoleGuard from "@/components/auth/role-guard";

export default function StaffDashboard() {
  return (
    <RoleGuard roles={["staff"]}>
      <div className="space-y-6">
        <PageHeader
          badge="My Workspace"
          title="Staff Dashboard"
          description="View assigned shifts, clock in/out, request time off, and manage swaps."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>This Week&apos;s Schedule</CardTitle>
              <CardDescription>Your assigned shifts and open slots.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <UnitSchedule />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Clock</CardTitle>
              <CardDescription>Tap to clock in or out.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ClockWidget />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Time Off</CardTitle>
              <CardDescription>Submit a PTO, sick, or unpaid leave request.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Status of your time-off submissions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <TimeOffTable scope="self" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shift Swaps</CardTitle>
            <CardDescription>Your swap requests and their status.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <SwapRequestsTable />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
