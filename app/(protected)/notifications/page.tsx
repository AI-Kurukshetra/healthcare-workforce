"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/modules/notifications/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { showSuccess, showError } from "@/lib/utils/toast";
import { Bell, Check, CheckCheck } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return;
      const { data: rows } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", data.session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications((rows as Notification[]) ?? []);
      setLoading(false);
    });
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      showSuccess("Marked as read");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      showSuccess("All notifications marked as read");
    } catch (err: any) {
      showError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader badge="Alerts" title="Notifications" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Alerts"
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        actions={
          unread > 0 ? (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors ${
                n.read_at ? "border-border bg-white" : "border-brand-200 bg-brand-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.read_at ? "bg-slate-100 text-slate-400" : "bg-brand-100 text-brand-600"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>}
                    <p className="mt-1 text-xs text-slate-400">{dayjs(n.created_at).fromNow()}</p>
                  </div>
                </div>
                {!n.read_at && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
