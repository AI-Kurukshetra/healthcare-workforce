"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDepartment } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { Building2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
});

type FormData = z.infer<typeof schema>;

export default function DepartmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createDepartment(data);
      showSuccess("Department created successfully");
      reset();
      onSuccess?.();
    } catch (err: any) {
      showError(err.message ?? "Unable to create department");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Department Name</label>
        <input
          {...register("name")}
          placeholder="e.g. Emergency Medicine"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        <Building2 className="h-4 w-4 shrink-0 text-current" aria-hidden />
        {isSubmitting ? "Creating…" : "Add Department"}
      </button>
    </form>
  );
}
