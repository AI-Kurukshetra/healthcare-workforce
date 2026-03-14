import { createSupabaseServerClient } from "@/lib/supabase/server";

async function loadData() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("shift_utilization")
    .select("unit_id, day, hours, shifts")
    .order("day", { ascending: true })
    .limit(30);
  return data ?? [];
}

export default async function UtilizationChart() {
  const rows = await loadData();
  return (
    <div className="rounded border p-4 bg-white">
      <div className="font-semibold mb-2">Shift Utilization (hrs)</div>
      <ul className="text-sm space-y-1">
        {rows.map((row) => (
          <li key={`${row.unit_id}-${row.day}`}>
            {row.day}: {row.hours} hrs / {row.shifts} shifts
          </li>
        ))}
      </ul>
    </div>
  );
}
