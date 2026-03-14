import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionWithRole() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
    supabase.from("user_roles").select("roles(slug)").eq("user_id", session.user.id).maybeSingle(),
    supabase.from("profiles").select("department_id, unit_id").eq("id", session.user.id).maybeSingle(),
  ]);

  const role = (roleRow as any)?.roles?.slug ?? (session.user.user_metadata.role as string | undefined) ?? "staff";
  return { session, role, departmentId: (profileRow as any)?.department_id ?? null, unitId: (profileRow as any)?.unit_id ?? null };
}
