"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createShift } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { CalendarPlus } from "lucide-react";

const schema = z
  .object({
    unitId: z.string().uuid("Select a unit"),
    staffId: z.string().optional(),
    startAt: z.string().min(1, "Start date/time is required"),
    endAt: z.string().min(1, "End date/time is required"),
  })
  .refine((d) => new Date(d.endAt) > new Date(d.startAt), {
    message: "End must be after start",
    path: ["endAt"],
  });

type FormData = z.infer<typeof schema>;

export default function ShiftForm({ onSuccess }: { onSuccess?: () => void }) {
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; full_name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("units").select("id, name").order("name").then(({ data }) => setUnits(data ?? []));
    supabase.from("profiles").select("id, full_name").order("full_name").then(({ data }) => setStaff(data ?? []));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await createShift({
        unitId: data.unitId,
        staffId: data.staffId || null,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      });
      showSuccess("Shift created successfully");
      reset();
      onSuccess?.();
    } catch (err: any) {
      showError(err.message ?? "Unable to create shift");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Unit *</label>
          <select
            {...register("unitId")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Select unit…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {errors.unitId && <p className="text-xs text-red-600">{errors.unitId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Assign Staff</label>
          <select
            {...register("staffId")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Unassigned (open shift)</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Start *</label>
          <input
            type="datetime-local"
            {...register("startAt")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.startAt && <p className="text-xs text-red-600">{errors.startAt.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">End *</label>
          <input
            type="datetime-local"
            {...register("endAt")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.endAt && <p className="text-xs text-red-600">{errors.endAt.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        <CalendarPlus className="h-4 w-4" />
        {isSubmitting ? "Creating…" : "Create Shift"}
      </button>
    </form>
  );
}
