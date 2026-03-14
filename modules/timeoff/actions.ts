"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { getCallerContext } from "@/modules/auth/queries";

const timeOffSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.string().min(3),
});

export async function requestTimeOff(input: unknown) {
  const data = timeOffSchema.parse(input);
  const supabase = createSupabaseActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Not authenticated");

  // Ensure a profile exists for this user (avoids FK errors)
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    const role = (user.user_metadata?.role as "admin" | "manager" | "staff") ?? "staff";
    const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Unknown";
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      role,
    });
    if (profileError) throw new Error(profileError.message ?? "Unable to create profile");
  }

  const { error } = await supabase.from("time_off_requests").insert({
    staff_id: user.id,
    start_date: data.startDate,
    end_date: data.endDate,
    type: data.type,
  });
  if (error) throw new Error(error.message ?? "Unable to submit time off");
  revalidatePath("/timeoff");
  revalidatePath("/my-timeoff");
  revalidatePath("/dashboard/staff");
}

function assertCanDecideTimeOff(
  callerRole: "admin" | "manager" | "staff",
  callerDepartmentId: string | null,
  staffDepartmentId: string | null
) {
  if (callerRole === "admin") return;
  if (callerRole === "manager" && callerDepartmentId && callerDepartmentId === staffDepartmentId) return;
  throw new Error("Only an admin or the manager of the staff's department can approve or decline this request.");
}

export async function approveTimeOff(id: string, decidedBy: string) {
  const supabase = createSupabaseActionClient();
  const caller = await getCallerContext(supabase);
  if (!caller) throw new Error("Not authenticated");

  const { data: request, error: fetchError } = await supabase
    .from("time_off_requests")
    .select("staff_id")
    .eq("id", id as string)
    .maybeSingle();
  if (fetchError || !request?.staff_id) throw new Error("Request not found");

  const { data: profile } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", request.staff_id)
    .maybeSingle();
  const staffDeptId = (profile as { department_id: string | null } | null)?.department_id ?? null;
  assertCanDecideTimeOff(caller.role, caller.departmentId, staffDeptId);

  const { error } = await supabase
    .from("time_off_requests")
    .update({ status: "approved", decided_by: decidedBy } as { status: string; decided_by: string })
    .eq("id", id as string);
  if (error) throw new Error(error.message ?? "Unable to approve request");
  revalidatePath("/timeoff");
}

export async function declineTimeOff(id: string, decidedBy: string) {
  const supabase = createSupabaseActionClient();
  const caller = await getCallerContext(supabase);
  if (!caller) throw new Error("Not authenticated");

  const { data: request, error: fetchError } = await supabase
    .from("time_off_requests")
    .select("staff_id")
    .eq("id", id as string)
    .maybeSingle();
  if (fetchError || !request?.staff_id) throw new Error("Request not found");

  const { data: profile } = await supabase
    .from("profiles")
    .select("department_id")
    .eq("id", request.staff_id)
    .maybeSingle();
  const staffDeptId = (profile as { department_id: string | null } | null)?.department_id ?? null;
  assertCanDecideTimeOff(caller.role, caller.departmentId, staffDeptId);

  const { error } = await supabase
    .from("time_off_requests")
    .update({ status: "declined", decided_by: decidedBy } as { status: string; decided_by: string })
    .eq("id", id as string);
  if (error) throw new Error(error.message ?? "Unable to decline request");
  revalidatePath("/timeoff");
}
