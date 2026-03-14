import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";

async function loadRequests() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("time_off_requests")
    .select("id, start_date, end_date, status, type")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export default async function TimeOffTable() {
  let rows: Awaited<ReturnType<typeof loadRequests>> = [];
  try {
    rows = await loadRequests();
  } catch (error) {
    console.error("timeoff table failed", error);
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-sm text-slate-600">
        Unable to load time off requests right now.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-sm text-slate-600">
        No requests submitted yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="p-3">Dates</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-brand-50/40">
              <td className="p-3">
                {dayjs(row.start_date).format("MMM D")} - {dayjs(row.end_date).format("MMM D")}
              </td>
              <td className="p-3 capitalize">{row.type}</td>
              <td className="p-3 capitalize">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
