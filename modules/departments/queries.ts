import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listDepartments() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, created_at, units(id, name)")
    .order("name");
  if (error) {
    console.error("listDepartments failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getDepartmentById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, created_at, units(id, name, staff_assignments(id, staff_id))")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("getDepartmentById failed", error.message);
  return data;
}

export async function getDepartmentStats() {
  const supabase = createSupabaseServerClient();
  const { count: deptCount } = await supabase
    .from("departments")
    .select("*", { count: "exact", head: true });
  const { count: unitCount } = await supabase
    .from("units")
    .select("*", { count: "exact", head: true });
  return { departments: deptCount ?? 0, units: unitCount ?? 0 };
}
