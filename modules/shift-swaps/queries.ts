import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listSwapRequests(filters?: { status?: string }) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("swap_requests")
    .select(`
      id, shift_id, from_staff_id, to_staff_id, status, reason, created_at,
      from_profile:from_staff_id(full_name),
      to_profile:to_staff_id(full_name),
      shifts:shift_id(start_at, end_at, unit_id)
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    console.error("listSwapRequests failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPendingSwapCount() {
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("swap_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
