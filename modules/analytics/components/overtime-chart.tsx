import { createSupabaseServerClient } from "@/lib/supabase/server";

async function loadData() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("time_entries")
    .select("staff_id, clock_in, clock_out")
    .order("clock_in", { ascending: false })
    .limit(50);
  return data ?? [];
}

export default async function OvertimeChart() {
  const rows = await loadData();
  return (
    <div className="rounded border p-4 bg-white">
      <div className="font-semibold mb-2">Overtime (sample)</div>
      <div className="text-sm text-gray-600">Compute hours and render chart here.</div>
      <div className="text-xs text-gray-500 mt-2">Entries loaded: {rows.length}</div>
    </div>
  );
}
