import Link from "next/link";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { listCredentialAlerts } from "../queries";

const tone: Record<string, string> = {
  expired: "bg-rose-50 text-rose-800 border border-rose-100",
  expiring_soon: "bg-amber-50 text-amber-800 border border-amber-100",
  ok: "bg-emerald-50 text-emerald-800 border border-emerald-100",
};

export default async function CredentialAlerts() {
  const alerts = await listCredentialAlerts();

  return (
    <Card className="border-amber-100 shadow-glass">
      <CardHeader className="pb-3">
        <CardTitle>Credential Expiration Alerts</CardTitle>
        <CardDescription>Licenses nearing expiry (within 45 days) or already lapsed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            All credentials are current. No renewals due in the next 45 days.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const level = tone[alert.alert_level ?? "ok"] ?? tone.ok;
              const expiry = alert.expires_at ? dayjs(alert.expires_at).format("MMM D, YYYY") : "—";
              return (
                <div key={alert.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{alert.type}</div>
                    <div className="text-xs text-slate-600">
                      {alert.staff_name ?? "Unknown staff"} · License {alert.license_number ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-semibold ${level}`}>
                      {alert.alert_level === "expired"
                        ? "Expired"
                        : alert.alert_level === "expiring_soon"
                        ? "Expires soon"
                        : "OK"}
                    </span>
                    <span className="text-slate-600">{expiry}</span>
                    <Link
                      href={`/staff/${alert.staff_id}`}
                      className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      View staff
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
