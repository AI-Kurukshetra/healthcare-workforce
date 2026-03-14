"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createStaff, updateStaff } from "../actions";

const staffSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "staff"]),
  employmentType: z.string().optional(),
  departmentId: z.string().optional(),
  unitId: z.string().optional(),
});

type FormData = z.infer<typeof staffSchema>;

interface Department {
  id: string;
  name: string;
  units: { id: string; name: string }[];
}

export default function StaffForm({
  initialData,
  departments,
}: {
  initialData?: any;
  departments: Department[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      id: initialData?.id,
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      role: initialData?.role || "staff",
      employmentType: initialData?.title || "",
      departmentId: initialData?.departmentId || "",
      unitId: initialData?.unitId || "",
    },
  });

  const selectedDeptId = watch("departmentId");
  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (initialData) {
        await updateStaff(data);
        toast.success("Staff profile updated");
      } else {
        await createStaff(data);
        toast.success("Staff member created successfully");
      }
      router.push("/staff");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input {...register("firstName")} placeholder="John" />
              {errors.firstName && <p className="text-xs text-rose-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input {...register("lastName")} placeholder="Doe" />
              {errors.lastName && <p className="text-xs text-rose-600">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input {...register("email")} type="email" placeholder="john@hospital.org" disabled={!!initialData} />
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input {...register("phone")} placeholder="(555) 123-4567" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Professional Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>System Role *</Label>
              <select
                {...register("role")}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Employment Type</Label>
              <select
                {...register("employmentType")}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select type...</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="PRN">PRN</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <select
                {...register("departmentId")}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <select
                {...register("unitId")}
                disabled={!selectedDept || selectedDept.units.length === 0}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-400 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select unit...</option>
                {selectedDept?.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Save Changes" : "Create Staff"}
          </Button>
        </div>
      </form>
    </div>
  );
}
