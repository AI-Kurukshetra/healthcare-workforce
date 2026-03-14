"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, suffix, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-xs focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50",
          className
        )}
      >
        {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
        <input
          ref={ref}
          className="w-full bg-transparent text-sm text-text placeholder:text-slate-400 focus:outline-none"
          {...props}
        />
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
