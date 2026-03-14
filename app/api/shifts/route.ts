import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

type Role = "admin" | "manager" | "staff";

function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Service role key is missing");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") === "self" ? "self" : "all";
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("roles(slug)").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("profiles").select("department_id").eq("id", session.user.id).maybeSingle(),
    ]);

    const role = (((roleRow as any)?.roles?.slug ?? session.user.user_metadata?.role ?? "staff") as Role) || "staff";
    const departmentId = (profileRow as any)?.department_id ?? null;

    const adminClient = createAdminSupabaseClient();
    let query = adminClient
      .from("shifts")
      .select("id, unit_id, staff_id, start_at, end_at, status")
      .order("start_at", { ascending: true });

    if (from) query = query.gte("start_at", from);
    if (to) query = query.lte("end_at", to);

    if (scope === "self" || role === "staff") {
      query = query.or(`staff_id.eq.${session.user.id},staff_id.is.null`);
    } else if (role === "manager") {
      if (!departmentId) {
        return NextResponse.json([]);
      }

      const { data: units, error: unitsError } = await adminClient
        .from("units")
        .select("id")
        .eq("department_id", departmentId);

      if (unitsError) {
        return NextResponse.json({ error: unitsError.message }, { status: 500 });
      }

      const unitIds = (units ?? []).map((unit) => unit.id);
      if (unitIds.length === 0) {
        return NextResponse.json([]);
      }

      query = query.in("unit_id", unitIds);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to load shifts" }, { status: 500 });
  }
}
