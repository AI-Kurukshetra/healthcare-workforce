"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseActionClient } from "@/lib/supabase/action";

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

export async function approveTimeOff(id: string, decidedBy: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase
    .from("time_off_requests")
    .update({ status: "approved", decided_by: decidedBy } as any)
    .eq("id", id as any);
  if (error) throw new Error(error.message ?? "Unable to approve request");
  revalidatePath("/timeoff");
}

export async function declineTimeOff(id: string, decidedBy: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase
    .from("time_off_requests")
    .update({ status: "declined", decided_by: decidedBy } as any)
    .eq("id", id as any);
  if (error) throw new Error(error.message ?? "Unable to decline request");
  revalidatePath("/timeoff");
}
