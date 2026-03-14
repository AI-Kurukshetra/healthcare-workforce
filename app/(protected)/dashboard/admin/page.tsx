import { Suspense } from "react";
import { Users, Building2, ShieldCheck, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PageHeader } from "@/components/ui/page-header";
import StaffTable from "@/modules/staff/components/staff-table";
import NotificationList from "@/modules/notifications/components/notification-list";
import ExpiringCredentials from "@/modules/credentials/components/expiring-credentials";
import { getAnalyticsOverview } from "@/modules/analytics/queries";
import { listStaff } from "@/modules/staff/queries";
import RoleGuard from "@/components/auth/role-guard";

async function DashboardStaffTable() {
  const staffData = await listStaff();
  return <StaffTable data={staffData} canManage />;
}

async function OverviewWidgets() {
  let overview = { totalStaff: 0, totalDepartments: 0, credentialAlerts: 0, openShifts: 0 };
  try {
    overview = await getAnalyticsOverview();
  } catch {}

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard icon={Users} label="Total Staff" value={overview.totalStaff} accent="bg-brand-500" />
      <DashboardCard icon={Building2} label="Departments" value={overview.totalDepartments} accent="bg-emerald-500" />
      <DashboardCard
        icon={ShieldCheck}
        label="Credential Alerts"
        value={overview.credentialAlerts}
        accent="bg-amber-500"
        trend={overview.credentialAlerts > 0 ? { value: `${overview.credentialAlerts} expiring`, positive: false } : undefined}
      />
      <DashboardCard icon={BarChart3} label="Open Shifts" value={overview.openShifts} accent="bg-violet-500" />
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard roles={["admin"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Platform oversight"
          title="Admin Dashboard"
          description="System metrics, workforce headcount, credential alerts, and compliance monitoring."
        />

        <Suspense fallback={<WidgetSkeleton />}>
          <OverviewWidgets />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>Live roster with roles for fast access reviews.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<TableSkeleton />}>
                <DashboardStaffTable />
              </Suspense>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credential Alerts</CardTitle>
                <CardDescription>Expiring and expired certifications.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Suspense fallback={<ListSkeleton />}>
                  <ExpiringCredentials />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Schedule, credential, and compliance alerts.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Suspense fallback={<ListSkeleton />}>
                  <NotificationList />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
