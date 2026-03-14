import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { getStaffById } from "../queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AvailabilityBadges } from "./availability-badges";
import { SkillBadge } from "./skill-badge";

type Props = { id: string };

export default async function StaffProfile({ id }: Props) {
  const staff = await getStaffById(id);
  if (!staff) return notFound();

  const credentialTone = (expiresAt?: string | null) => {
    if (!expiresAt) return "bg-slate-100 text-slate-700";
    const days = dayjs(expiresAt).diff(dayjs(), "day");
    if (days < 0) return "bg-rose-50 text-rose-800";
    if (days <= 45) return "bg-amber-50 text-amber-800";
    return "bg-emerald-50 text-emerald-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{staff.name}</CardTitle>
          <CardDescription className="space-x-2 text-sm">
            <span className="rounded-full bg-brand-50 px-2 py-1 font-semibold text-brand-700">{staff.role}</span>
            {staff.title && <span className="text-slate-600">{staff.title}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Contact</div>
            {staff.email && <div>Email: {staff.email}</div>}
            {staff.phone && <div>Phone: {staff.phone}</div>}
            {staff.shift_preference && <div>Shift preference: {staff.shift_preference}</div>}
            {staff.emergency_contact && (
              <div className="rounded-lg bg-muted px-3 py-2 text-xs">
                <div className="font-semibold text-slate-800">Emergency contact</div>
                <div>{staff.emergency_contact.name}</div>
                <div>{staff.emergency_contact.relationship}</div>
                <div>{staff.emergency_contact.phone}</div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="font-semibold text-slate-900">Availability</div>
            {staff.availability?.length ? (
              <AvailabilityBadges availability={staff.availability} />
            ) : (
              <p className="text-sm text-slate-600">No availability provided.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & certifications</CardTitle>
          <CardDescription>Capabilities tracked for this staff member.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {staff.skills.length > 0 ? (
            staff.skills.map((skill) => (
              <SkillBadge
                key={skill.id}
                name={skill.name}
                level={skill.level}
                expiresAt={skill.expires_at ?? undefined}
              />
            ))
          ) : (
            <p className="text-sm text-slate-600">No skills recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Licenses & Credentials</CardTitle>
          <CardDescription>Active credentials with expiry monitoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {staff.credentials.length > 0 ? (
            staff.credentials.map((cred) => {
              const tone = credentialTone(cred.expires_at);
              return (
                <div
                  key={cred.id}
                  className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{cred.type}</div>
                    <div className="text-xs text-slate-600">License {cred.license_number ?? "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-semibold ${tone}`}>{cred.status}</span>
                    <span className="text-slate-600">
                      {cred.expires_at ? `Expires ${dayjs(cred.expires_at).format("MMM D, YYYY")}` : "No expiry date"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-600">No credentials recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
