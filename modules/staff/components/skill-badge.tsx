"use client";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  level?: string | null;
  expiresAt?: string | null;
  className?: string;
};

const levelTone: Record<string, string> = {
  novice: "bg-slate-100 text-slate-700",
  intermediate: "bg-brand-50 text-brand-800",
  advanced: "bg-emerald-50 text-emerald-800",
  expert: "bg-indigo-50 text-indigo-800",
};

export function SkillBadge({ name, level, expiresAt, className }: Props) {
  const tone = (level && levelTone[level]) || "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-xs",
        tone,
        className
      )}
    >
      {name}
      {level && <span className="text-[10px] uppercase tracking-wide">{level}</span>}
      {expiresAt && <span className="text-[10px] text-slate-500">exp {expiresAt}</span>}
    </span>
  );
}
