"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Clock,
  CalendarOff,
  ShieldCheck,
  BarChart3,
  Bell,
  Menu,
  X,
  HeartPulse,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Schedules", href: "/schedules", icon: CalendarDays },
  { label: "Time Tracking", href: "/time-tracking", icon: Clock },
  { label: "Time Off", href: "/timeoff", icon: CalendarOff },
  { label: "Credentials", href: "/credentials", icon: ShieldCheck },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname.startsWith("/dashboard");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-border transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">HealthForce</p>
            <p className="text-[11px] text-slate-500">Workforce Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-50 text-brand-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] flex-shrink-0 ${
                    active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-[11px] text-slate-400">© 2026 HealthForce</p>
        </div>
      </aside>
    </>
  );
}
