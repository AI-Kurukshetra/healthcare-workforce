import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ badge, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        {badge && (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{badge}</p>
        )}
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
