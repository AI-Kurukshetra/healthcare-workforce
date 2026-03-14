"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { revalidatePath } from "next/cache";
import { getCallerContext } from "@/modules/auth/queries";

const swapSchema = z.object({
  shiftId: z.string().uuid(),
  toStaffId: z.string().uuid(),
  reason: z.string().min(3).optional(),
});

export async function requestSwap(input: unknown, fromStaffId: string) {
  const data = swapSchema.parse(input);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("swap_requests").insert({
    shift_id: data.shiftId,
    from_staff_id: fromStaffId,
    to_staff_id: data.toStaffId,
    reason: data.reason,
  });
  if (error) throw error;
  revalidatePath("/schedules");
}

/** Only admin or a manager of the requesting/accepting staff's department can approve/decline. */
export async function decideSwap(id: string, status: "approved" | "declined", decidedBy: string) {
  const supabase = createSupabaseActionClient();
  const caller = await getCallerContext(supabase);
  if (!caller) throw new Error("Not authenticated");

  const { data: swap, error: fetchError } = await supabase
    .from("swap_requests")
    .select("from_staff_id, to_staff_id")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !swap) throw new Error("Swap request not found");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, department_id")
    .in("id", [swap.from_staff_id, swap.to_staff_id]);
  const staffDeptIds = (profiles ?? []).map((p: { department_id: string | null }) => p.department_id);
  const isInCallerDepartment =
    caller.role === "admin" ||
    (caller.role === "manager" && caller.departmentId && staffDeptIds.includes(caller.departmentId));
  if (!isInCallerDepartment)
    throw new Error("Only an admin or the manager of the staff's department can approve or decline this swap.");

  const { error } = await supabase
    .from("swap_requests")
    .update({ status, decided_by: decidedBy })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/schedules");
}
