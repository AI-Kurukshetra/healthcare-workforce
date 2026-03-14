import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import { getSessionWithRole } from "@/modules/auth/queries";
import TimeOffDecisionActions from "./timeoff-decision-actions";

type Scope = "self" | "team" | "all";

async function loadRequests(scope: Scope) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (scope === "self" && !user?.id) return [];

  let query = supabase
    .from("time_off_requests")
    .select("id, start_date, end_date, status, type, staff_id, profiles:staff_id(full_name, department_id)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (scope === "self" && user?.id) {
    query = query.eq("staff_id", user.id);
  }

  if (scope === "team") {
    const ctx = await getSessionWithRole();
    if (ctx?.role === "manager" && !ctx.departmentId) {
      return [];
    }
    if (ctx?.departmentId) {
      query = query.eq("profiles.department_id", ctx.departmentId);
    }
  }

  // For "team" scope we rely on RLS to restrict rows to the manager's department.

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export default async function TimeOffTable({ scope = "self" }: { scope?: Scope }) {
  const session = await getSessionWithRole();
  const canDecide =
    scope !== "self" && (session?.role === "admin" || (session?.role === "manager" && Boolean(session.departmentId)));
  let rows: Awaited<ReturnType<typeof loadRequests>> = [];
  try {
    rows = await loadRequests(scope);
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
            {scope !== "self" && <th className="p-3">Requestor</th>}
            <th className="p-3">Dates</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            {canDecide && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-brand-50/40">
              {scope !== "self" && (
                <td className="p-3 text-slate-700">
                  {(row.profiles as { full_name?: string | null } | null)?.full_name ?? row.staff_id}
                </td>
              )}
              <td className="p-3">
                {dayjs(row.start_date).format("MMM D")} - {dayjs(row.end_date).format("MMM D")}
              </td>
              <td className="p-3 capitalize">{row.type}</td>
              <td className="p-3 capitalize">{row.status}</td>
              {canDecide && (
                <td className="p-3">
                  {row.status === "pending" ? <TimeOffDecisionActions requestId={row.id} /> : null}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
