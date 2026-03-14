"use server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function decideSwap(id: string, status: "approved" | "declined", decidedBy: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("swap_requests")
    .update({ status, decided_by: decidedBy })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/schedules");
}
