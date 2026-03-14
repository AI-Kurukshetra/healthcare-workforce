"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function clockIn() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("time_entries")
    .insert({ staff_id: user.id, clock_in: new Date().toISOString(), method: "manual" })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/time-tracking");
  return data.id as string;
}

export async function clockOut(entryId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("time_entries")
    .update({ clock_out: new Date().toISOString() })
    .eq("id", entryId);
  if (error) throw error;
  revalidatePath("/time-tracking");
}
