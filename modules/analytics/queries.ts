import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAnalyticsOverview() {
  const supabase = createSupabaseServerClient();

  const [staffRes, deptRes, credRes, shiftRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("departments").select("*", { count: "exact", head: true }),
    supabase
      .from("credential_alerts")
      .select("*", { count: "exact", head: true })
      .in("alert_level", ["expired", "expiring_soon"]),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .is("staff_id", null)
      .gte("start_at", new Date().toISOString()),
  ]);

  return {
    totalStaff: staffRes.count ?? 0,
    totalDepartments: deptRes.count ?? 0,
    credentialAlerts: credRes.count ?? 0,
    openShifts: shiftRes.count ?? 0,
  };
}

export async function getPendingApprovalCounts() {
  const supabase = createSupabaseServerClient();

  const [timeoffRes, swapRes] = await Promise.all([
    supabase
      .from("time_off_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("swap_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    pendingTimeOff: timeoffRes.count ?? 0,
    pendingSwaps: swapRes.count ?? 0,
    total: (timeoffRes.count ?? 0) + (swapRes.count ?? 0),
  };
}
