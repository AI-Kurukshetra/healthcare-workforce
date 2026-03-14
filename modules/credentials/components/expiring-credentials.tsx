import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";

async function loadExpiring() {
  try {
    const supabase = createSupabaseServerClient();
    const target = dayjs().add(30, "day").toISOString();
    const { data, error } = await supabase
      .from("credentials")
      .select("id, type, expires_at, staff_id")
      .lte("expires_at", target)
      .order("expires_at", { ascending: true })
      .limit(6);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("expiring credentials failed", error);
    return [];
  }
}

export default async function ExpiringCredentials() {
  const creds = await loadExpiring();

  if (creds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-sm text-slate-600">
        No credentials expiring in the next 30 days.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {creds.map((cred) => (
        <li
          key={cred.id}
          className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">{cred.type}</div>
            <p className="text-xs text-slate-500">Staff ID: {cred.staff_id ?? "Unassigned"}</p>
          </div>
          <div className="text-sm font-semibold text-amber-700">
            {cred.expires_at ? dayjs(cred.expires_at).format("MMM D") : "-"}
          </div>
        </li>
      ))}
    </ul>
  );
}
