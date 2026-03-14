"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
};

export default function NotificationList() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, body, created_at, read_at")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        setItems(data ?? []);
      } catch (err: any) {
        const message = err?.message ?? "Unable to load notifications";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => setItems((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Unable to load notifications" description={error} />;
  }

  if (items.length === 0) {
    return <EmptyState title="No notifications" description="You are all caught up." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li key={n.id} className="rounded-lg border border-border bg-white p-3 shadow-xs">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-slate-900">{n.title}</span>
            <span className="text-slate-500">{dayjs(n.created_at).fromNow()}</span>
          </div>
          {n.body && <div className="mt-1 text-sm text-slate-700">{n.body}</div>}
        </li>
      ))}
    </ul>
  );
}
