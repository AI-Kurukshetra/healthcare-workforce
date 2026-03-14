"use server";
import { createSupabaseActionClient } from "@/lib/supabase/action";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message ?? "Unable to mark notification as read");
  revalidatePath("/notifications");
}

export async function markAllNotificationsAsRead() {
  const supabase = createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);
  if (error) throw new Error(error.message ?? "Unable to mark notifications as read");
  revalidatePath("/notifications");
}

export async function createNotification(recipientId: string, title: string, body?: string, actionUrl?: string) {
  const supabase = createSupabaseActionClient();
  const { error } = await supabase.from("notifications").insert({
    recipient_id: recipientId,
    title,
    body: body ?? null,
    action_url: actionUrl ?? null,
  });
  if (error) throw new Error(error.message ?? "Unable to create notification");
}
