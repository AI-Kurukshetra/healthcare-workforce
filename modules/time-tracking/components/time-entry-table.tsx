import { createSupabaseServerClient } from "@/lib/supabase/server";
import dayjs from "dayjs";

async function loadEntries() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select("id, clock_in, clock_out, method")
    .order("clock_in", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export default async function TimeEntryTable() {
  const rows = await loadEntries();
  return (
    <div className="overflow-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Clock In</th>
            <th className="p-3 text-left">Clock Out</th>
            <th className="p-3 text-left">Method</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-3">{dayjs(row.clock_in).format("MMM D, HH:mm")}</td>
              <td className="p-3">
                {row.clock_out ? dayjs(row.clock_out).format("MMM D, HH:mm") : "—"}
              </td>
              <td className="p-3 capitalize">{row.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
