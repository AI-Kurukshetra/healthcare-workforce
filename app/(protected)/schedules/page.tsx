import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ScheduleCalendar from "@/modules/schedules/components/schedule-calendar";
import ShiftForm from "@/modules/schedules/components/shift-form";
import Link from "next/link";
import RoleGuard from "@/components/auth/role-guard";

export default function SchedulesPage() {
  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Workforce planning"
          title="Schedules"
          description="Create and assign shifts, view the weekly calendar, and manage coverage."
          actions={
            <Link
              href="/schedules/swaps"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Swap Requests
            </Link>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Create Shift</CardTitle>
            <CardDescription>Select a unit, assign staff, and set the time window.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ShiftForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Calendar</CardTitle>
            <CardDescription>Shift assignments across the week.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ScheduleCalendar />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
