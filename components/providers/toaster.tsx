"use client";
import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      richColors
      position="top-right"
      closeButton
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "rounded-xl border border-border shadow-lg bg-white",
          title: "text-sm font-semibold text-slate-900",
          description: "text-xs text-slate-600",
        },
      }}
    />
  );
}
