"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { requestSwap } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { ArrowRightLeft } from "lucide-react";

const schema = z.object({
  shiftId: z.string().uuid("Select a shift"),
  toStaffId: z.string().uuid("Select a staff member"),
  reason: z.string().min(3, "Provide a reason").optional(),
});

type FormData = z.infer<typeof schema>;

export default function SwapRequestForm({ fromStaffId }: { fromStaffId: string }) {
  const [shifts, setShifts] = useState<{ id: string; start_at: string; end_at: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; full_name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("shifts")
      .select("id, start_at, end_at")
      .eq("staff_id", fromStaffId)
      .gte("start_at", new Date().toISOString())
      .order("start_at")
      .then(({ data }) => setShifts(data ?? []));

    supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", fromStaffId)
      .order("full_name")
      .then(({ data }) => setStaff(data ?? []));
  }, [fromStaffId]);

  const onSubmit = async (data: FormData) => {
    try {
      await requestSwap(data, fromStaffId);
      showSuccess("Shift swap request sent");
      reset();
    } catch (err: any) {
      showError(err.message ?? "Unable to request swap");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">My Shift *</label>
        <select
          {...register("shiftId")}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Select a shift…</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.start_at).toLocaleDateString()} {new Date(s.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(s.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </option>
          ))}
        </select>
        {errors.shiftId && <p className="text-xs text-red-600">{errors.shiftId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Swap With *</label>
        <select
          {...register("toStaffId")}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Select a colleague…</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>
        {errors.toStaffId && <p className="text-xs text-red-600">{errors.toStaffId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Reason</label>
        <textarea
          {...register("reason")}
          rows={2}
          placeholder="Why do you want to swap?"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.reason && <p className="text-xs text-red-600">{errors.reason.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        <ArrowRightLeft className="h-4 w-4" />
        {isSubmitting ? "Sending…" : "Request Swap"}
      </button>
    </form>
  );
}
