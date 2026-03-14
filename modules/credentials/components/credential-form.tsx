"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertCredential } from "@/modules/staff/actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { ShieldCheck } from "lucide-react";

const schema = z.object({
  staffId: z.string().uuid(),
  type: z.string().min(2, "Credential type is required"),
  licenseNumber: z.string().optional(),
  issuedBy: z.string().optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(["valid", "expiring", "expired", "suspended"]),
  documentUrl: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function CredentialForm({
  staffId,
  credential,
  onSuccess,
}: {
  staffId: string;
  credential?: any;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId,
      type: credential?.type ?? "",
      licenseNumber: credential?.license_number ?? "",
      issuedBy: credential?.issued_by ?? "",
      issuedAt: credential?.issued_at ?? "",
      expiresAt: credential?.expires_at ?? "",
      status: credential?.status ?? "valid",
      documentUrl: credential?.document_url ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await upsertCredential({
        id: credential?.id,
        staffId: data.staffId,
        type: data.type,
        licenseNumber: data.licenseNumber || null,
        issuedBy: data.issuedBy || null,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: data.status,
        documentUrl: data.documentUrl || null,
      });
      showSuccess(credential ? "Credential updated" : "Credential added");
      if (!credential) reset({ staffId });
      onSuccess?.();
    } catch (err: any) {
      showError(err.message ?? "Unable to save credential");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("staffId")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type *</label>
          <input
            {...register("type")}
            placeholder="e.g. RN License"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">License Number</label>
          <input
            {...register("licenseNumber")}
            placeholder="ABC-123456"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Issued By</label>
          <input
            {...register("issuedBy")}
            placeholder="State Board of Nursing"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="valid">Valid</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Issued Date</label>
          <input
            type="date"
            {...register("issuedAt")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Expiry Date</label>
          <input
            type="date"
            {...register("expiresAt")}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-current" aria-hidden />
        {isSubmitting ? "Saving…" : credential ? "Update Credential" : "Add Credential"}
      </button>
    </form>
  );
}
