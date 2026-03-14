import dayjs from "dayjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { listCredentials } from "../queries";

export default async function CredentialsBoard() {
  const creds = await listCredentials();

  if (creds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-6 py-10 text-center text-sm text-slate-600">
        No credentials on file yet. Add licenses to start tracking renewals.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {creds.map((cred) => {
        const daysLeft = cred.expires_at ? dayjs(cred.expires_at).diff(dayjs(), "day") : null;
        const statusTone =
          daysLeft === null
            ? "bg-slate-100 text-slate-700"
            : daysLeft < 0
            ? "bg-rose-50 text-rose-700"
            : daysLeft <= 45
            ? "bg-amber-50 text-amber-800"
            : "bg-emerald-50 text-emerald-700";

        return (
          <Card key={cred.id} className="h-full border-brand-100/60 shadow-glass">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs font-semibold tracking-wide text-brand-700">
                {cred.type}
              </CardDescription>
              <CardTitle className="text-lg text-slate-900">
                {cred.license_number || "Pending number"}
              </CardTitle>
              <div className="text-sm text-slate-600">Holder: {cred.staff_name ?? "N/A"}</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                  {cred.status}
                </span>
                {daysLeft !== null && (
                  <span className="text-xs text-slate-500">
                    {daysLeft < 0 ? `${Math.abs(daysLeft)} days past due` : `${daysLeft} days left`}
                  </span>
                )}
              </div>
              <div className="text-slate-700">
                Expires: {cred.expires_at ? dayjs(cred.expires_at).format("MMM D, YYYY") : "N/A"}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
