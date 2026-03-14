import { Suspense } from "react";
import { Users, CalendarDays, Clock, CheckSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PageHeader } from "@/components/ui/page-header";
import ExpiringCredentials from "@/modules/credentials/components/expiring-credentials";
import PendingApprovals from "@/modules/timeoff/components/pending-approvals";
import SwapRequestsTable from "@/modules/shift-swaps/components/swap-requests-table";
import { getAnalyticsOverview, getPendingApprovalCounts } from "@/modules/analytics/queries";
import { getShiftCoverage, getOpenShiftsCount } from "@/modules/schedules/queries";
import RoleGuard from "@/components/auth/role-guard";

async function ManagerWidgets() {
  let overview = { totalStaff: 0, totalDepartments: 0, credentialAlerts: 0, openShifts: 0 };
  let pending = { total: 0 };
  let coverage = { total: 0, assigned: 0 };
  try {
    [overview, pending, coverage] = await Promise.all([
      getAnalyticsOverview(),
      getPendingApprovalCounts(),
      getShiftCoverage(),
    ]);
  } catch {}

  const coveragePercent = coverage.total > 0 ? Math.round((coverage.assigned / coverage.total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard icon={Users} label="Department Staff" value={overview.totalStaff} accent="bg-brand-500" />
      <DashboardCard
        icon={CalendarDays}
        label="Shift Coverage"
        value={`${coveragePercent}%`}
        accent="bg-emerald-500"
        trend={{ value: `${coverage.assigned}/${coverage.total}`, positive: coveragePercent >= 80 }}
      />
      <DashboardCard
        icon={CheckSquare}
        label="Pending Approvals"
        value={pending.total}
        accent="bg-amber-500"
        trend={pending.total > 0 ? { value: "Action needed", positive: false } : undefined}
      />
      <DashboardCard icon={Clock} label="Open Shifts" value={overview.openShifts} accent="bg-violet-500" />
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-2 h-8 w-20" /></CardContent></Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-1/3" /><Skeleton className="mt-2 h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  return (
    <RoleGuard roles={["manager", "admin"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Operations Control"
          title="Manager Dashboard"
          description="Real-time staffing posture, credential expirations, and pending approvals."
        />

        <Suspense fallback={<WidgetSkeleton />}>
          <ManagerWidgets />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Time-off and swap requests waiting for your decision.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<ListSkeleton />}>
                <PendingApprovals />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expiring Credentials</CardTitle>
              <CardDescription>30-day lookahead to prevent shift interruptions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<ListSkeleton />}>
                <ExpiringCredentials />
              </Suspense>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Shift Swap Requests</CardTitle>
              <CardDescription>Review and decide on swap requests.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <SwapRequestsTable isManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
