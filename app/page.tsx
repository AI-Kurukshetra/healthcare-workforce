import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-4xl rounded-2xl bg-white/70 p-10 shadow-glass backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              Healthcare Workforce OS
            </p>
            <h1 className="text-4xl font-bold text-slate-900">
              Precision staffing for safer patient outcomes.
            </h1>
            <p className="text-base text-slate-600">
              Role-aware scheduling, credential governance, and timekeeping designed for hospital operations teams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signin">
                <Button>
                  Launch Console <span aria-hidden="true">→</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary">Create account</Button>
              </Link>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>HIPAA-ready workflows</span>
              <span>•</span>
              <span>Audit-grade access controls</span>
              <span>•</span>
              <span>Realtime staffing signals</span>
            </div>
          </div>
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Fast track</div>
              <p className="text-sm text-slate-600">
                Already invited? Sign in with your organizational email to view your shift board.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Admins</div>
                <div className="font-semibold text-slate-900">Capacity dashboards</div>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Managers</div>
                <div className="font-semibold text-slate-900">Schedule controls</div>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Staff</div>
                <div className="font-semibold text-slate-900">Shifts & credentials</div>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Compliance</div>
                <div className="font-semibold text-slate-900">Expirations & logs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
