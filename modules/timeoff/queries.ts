import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listTimeOffRequests(filters?: { staffId?: string; status?: string }) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("time_off_requests")
    .select("id, staff_id, start_date, end_date, type, status, reason, created_at, profiles:staff_id(full_name)")
    .order("created_at", { ascending: false });

  if (filters?.staffId) query = query.eq("staff_id", filters.staffId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    console.error("listTimeOffRequests failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPendingTimeOffCount() {
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("time_off_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
