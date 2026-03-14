import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DepartmentItem } from "./department-item";

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
  
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center bg-slate-50">
        <p className="text-slate-500">No departments setup yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {departments.map((dept) => (
        <DepartmentItem key={dept.id} dept={dept} />
      ))}
    </div>
  );
}
