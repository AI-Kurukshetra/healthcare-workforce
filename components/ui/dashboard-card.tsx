import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";

interface DashboardCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  accent?: string;
}

export function DashboardCard({ icon: Icon, label, value, trend, accent }: DashboardCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-glass">
      {/* Accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 ${accent ?? "bg-brand-500"}`} />
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5 shrink-0 text-current" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        {trend && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
              trend.positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend.value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
