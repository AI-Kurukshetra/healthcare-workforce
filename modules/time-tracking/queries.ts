import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listTimeEntries(staffId?: string) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("time_entries")
    .select("id, staff_id, shift_id, clock_in, clock_out, method, created_at, profiles:staff_id(full_name)")
    .order("clock_in", { ascending: false })
    .limit(50);
  if (staffId) query = query.eq("staff_id", staffId);
  const { data, error } = await query;
  if (error) {
    console.error("listTimeEntries failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getOvertimeStats() {
  const supabase = createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("overtime_threshold_minutes")
    .eq("id", 1)
    .maybeSingle();
  const threshold = settings?.overtime_threshold_minutes ?? 480;

  const { data: entries, error } = await supabase
    .from("time_entries")
    .select("staff_id, clock_in, clock_out")
    .not("clock_out", "is", null);

  if (error || !entries) return { totalOvertime: 0, staffWithOvertime: 0, threshold };

  const staffMinutes = new Map<string, number>();
  entries.forEach((e) => {
    if (!e.clock_out) return;
    const mins = (new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()) / 60000;
    staffMinutes.set(e.staff_id, (staffMinutes.get(e.staff_id) ?? 0) + mins);
  });

  let totalOvertime = 0;
  let staffWithOvertime = 0;
  staffMinutes.forEach((mins) => {
    if (mins > threshold) {
      totalOvertime += mins - threshold;
      staffWithOvertime++;
    }
  });

  return { totalOvertime: Math.round(totalOvertime / 60), staffWithOvertime, threshold };
}
