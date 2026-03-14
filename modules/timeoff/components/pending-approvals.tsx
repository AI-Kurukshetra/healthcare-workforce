import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import { getSessionWithRole } from "@/modules/auth/queries";

async function loadPending() {
  try {
    const supabase = createSupabaseServerClient();
    const ctx = await getSessionWithRole();

    let query = supabase
      .from("time_off_requests")
      .select("id, start_date, end_date, type, staff_id, profiles:staff_id(department_id)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5);

    if (ctx?.role === "manager" && ctx.departmentId) {
      query = query.eq("profiles.department_id", ctx.departmentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("pending approvals failed", error);
    return [];
  }
}

export default async function PendingApprovals() {
  const rows = await loadPending();

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-sm text-slate-600">
        All caught up. No pending approvals.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900 capitalize">{row.type}</div>
            <p className="text-xs text-slate-500">Requested by: {row.staff_id}</p>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {dayjs(row.start_date).format("MMM D")} - {dayjs(row.end_date).format("MMM D")}
          </div>
        </li>
      ))}
    </ul>
  );
}
