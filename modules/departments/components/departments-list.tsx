import { createSupabaseServerClient } from "@/lib/supabase/server";

async function loadData() {
  const supabase = createSupabaseServerClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, units:units(id, name)")
    .order("name");
  return departments ?? [];
}

export default async function DepartmentsList() {
  const departments = await loadData();
  return (
    <div className="space-y-4">
      {departments.map((dept) => (
        <div key={dept.id} className="rounded border p-4">
          <div className="font-semibold">{dept.name}</div>
          <ul className="mt-2 text-sm text-gray-600">
            {dept.units?.map((u: any) => (
              <li key={u.id}>• {u.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
