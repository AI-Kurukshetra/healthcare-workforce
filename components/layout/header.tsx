"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          name: (u.user_metadata?.full_name as string) || u.email || "User",
          role: (u.user_metadata?.role as string) || "staff",
          email: u.email || "",
        });
      }
    });

    /* unread count */
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", data.session.user.id)
        .is("read_at", null);
      setUnread(count ?? 0);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const roleBadge: Record<string, string> = {
    admin: "bg-red-50 text-red-700",
    manager: "bg-amber-50 text-amber-700",
    staff: "bg-brand-50 text-brand-700",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-6">
      {/* Left spacer for mobile toggle */}
      <div className="w-10 lg:hidden" />

      <div className="hidden lg:block">
        <h2 className="text-sm font-semibold text-slate-700">Healthcare Workforce Management</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 shrink-0 text-current" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* User profile */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleBadge[user.role] ?? roleBadge.staff}`}>
                {user.role}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0 text-current" aria-hidden />
        </button>
      </div>
    </header>
  );
}
