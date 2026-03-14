"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          {variant === "danger" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
