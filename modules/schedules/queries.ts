import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";

export async function listShifts(filters?: { unitId?: string; from?: string; to?: string }) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("shifts")
    .select("id, unit_id, staff_id, start_at, end_at, status, profiles:staff_id(full_name), units:unit_id(name)")
    .order("start_at", { ascending: true });

  if (filters?.unitId) query = query.eq("unit_id", filters.unitId);
  if (filters?.from) query = query.gte("start_at", filters.from);
  if (filters?.to) query = query.lte("end_at", filters.to);

  const { data, error } = await query;
  if (error) {
    console.error("listShifts failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getOpenShiftsCount() {
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .is("staff_id", null)
    .gte("start_at", dayjs().toISOString());
  return count ?? 0;
}

export async function getShiftCoverage() {
  const supabase = createSupabaseServerClient();
  const weekStart = dayjs().startOf("week").toISOString();
  const weekEnd = dayjs().endOf("week").toISOString();

  const { count: total } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .gte("start_at", weekStart)
    .lte("end_at", weekEnd);

  const { count: assigned } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .gte("start_at", weekStart)
    .lte("end_at", weekEnd)
    .not("staff_id", "is", null);

  return { total: total ?? 0, assigned: assigned ?? 0 };
}
