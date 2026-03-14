"use server";
import { z } from "zod";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { revalidatePath } from "next/cache";

const shiftSchema = z
  .object({
    unitId: z.string().uuid(),
    staffId: z.string().uuid().nullable(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .refine((d) => d.endAt > d.startAt, "End must be after start");

export async function createShift(input: unknown) {
  const data = shiftSchema.parse(input);
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.from("shifts").insert({
    unit_id: data.unitId,
    staff_id: data.staffId,
    start_at: data.startAt.toISOString(),
    end_at: data.endAt.toISOString(),
  } as any);
  if (error) throw new Error(error.message ?? "Unable to create shift");
  revalidatePath("/schedules");
}

export async function updateShift(id: string, input: { staffId?: string | null; status?: string }) {
  const supabase = createSupabaseActionClient();
  const payload: Record<string, unknown> = {};
  if (input.staffId !== undefined) payload.staff_id = input.staffId;
  if (input.status) payload.status = input.status;
  const { error } = await supabase.from("shifts").update(payload as any).eq("id", id as any);
  if (error) throw new Error(error.message ?? "Unable to update shift");
  revalidatePath("/schedules");
}

export async function deleteShift(id: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.from("shifts").delete().eq("id", id as any);
  if (error) throw new Error(error.message ?? "Unable to delete shift");
  revalidatePath("/schedules");
}
