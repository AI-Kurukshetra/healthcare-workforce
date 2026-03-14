import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OverviewCards from "@/modules/analytics/components/overview-cards";
import OvertimeChart from "@/modules/analytics/components/overtime-chart";
import UtilizationChart from "@/modules/analytics/components/utilization-chart";

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Insights"
        title="Reporting & Analytics"
        description="Workforce analytics, overtime trends, and shift utilization metrics."
      />

      <Suspense fallback={<ChartSkeleton />}>
        <OverviewCards />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overtime Analytics</CardTitle>
            <CardDescription>Weekly overtime hours across the organization.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<ChartSkeleton />}>
              <OvertimeChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shift Utilization</CardTitle>
            <CardDescription>Coverage rate and shift fill ratio by unit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<ChartSkeleton />}>
              <UtilizationChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
