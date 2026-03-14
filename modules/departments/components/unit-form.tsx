"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUnit } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";

const schema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(2, "Unit name must be at least 2 characters"),
});

type FormData = z.infer<typeof schema>;

export default function UnitForm({
  departmentId,
  onSuccess,
}: {
  departmentId: string;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { departmentId },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createUnit(data);
      showSuccess("Unit created successfully");
      reset({ departmentId });
      onSuccess?.();
    } catch (err: any) {
      showError(err.message ?? "Unable to create unit");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
      <input type="hidden" {...register("departmentId")} />
      <div className="flex-1 space-y-1">
        <input
          {...register("name")}
          placeholder="New unit name"
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
      >
        {isSubmitting ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
