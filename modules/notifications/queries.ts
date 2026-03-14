import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listNotifications(recipientId?: string) {
  const supabase = createSupabaseServerClient();

  if (!recipientId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    recipientId = user?.id;
  }
  if (!recipientId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("listNotifications failed", error.message);
    return [];
  }
  return data ?? [];
}

export async function getUnreadCount(recipientId?: string) {
  const supabase = createSupabaseServerClient();

  if (!recipientId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    recipientId = user?.id;
  }
  if (!recipientId) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .is("read_at", null);

  return count ?? 0;
}
