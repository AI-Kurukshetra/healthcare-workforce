import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CredentialsBoard from "@/modules/credentials/components/credentials-board";
import CredentialAlerts from "@/modules/credentials/components/credential-alerts";
import RoleGuard from "@/components/auth/role-guard";

function BoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function CredentialsPage() {
  return (
    <RoleGuard roles={["admin", "manager"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Compliance"
          title="Credentials & Licenses"
          description="Track certifications, license expirations, and document compliance."
        />

        <Card>
          <CardHeader>
            <CardTitle>Expiration Alerts</CardTitle>
            <CardDescription>Credentials expiring within 45 days or already expired.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<BoardSkeleton />}>
              <CredentialAlerts />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Credentials</CardTitle>
            <CardDescription>Complete credential inventory across all staff.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<BoardSkeleton />}>
              <CredentialsBoard />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
