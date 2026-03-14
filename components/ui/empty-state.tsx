"use client";
import { Button } from "./button";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted px-6 py-10 text-center">
      <div className="text-base font-semibold text-slate-800">{title}</div>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
