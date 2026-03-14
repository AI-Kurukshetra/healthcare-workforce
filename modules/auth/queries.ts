import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CallerContext = {
  userId: string;
  role: "admin" | "manager" | "staff";
  departmentId: string | null;
};

/** Use in server actions with the action Supabase client to get current user's role and department. */
export async function getCallerContext(supabase: SupabaseClient): Promise<CallerContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
    supabase.from("user_roles").select("roles(slug)").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("department_id").eq("id", user.id).maybeSingle(),
  ]);
  const role =
    (roleRow as { roles?: { slug: string } } | null)?.roles?.slug ??
    (user.user_metadata?.role as string) ??
    "staff";
  return {
    userId: user.id,
    role: role as "admin" | "manager" | "staff",
    departmentId: (profileRow as { department_id: string | null } | null)?.department_id ?? null,
  };
}

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
