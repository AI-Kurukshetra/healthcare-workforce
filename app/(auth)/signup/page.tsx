"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { signUp } from "@/modules/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  fullName: z.string().min(2, "Please enter a full name"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "manager", "staff"]),
});

export default function SignUpPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "staff" as const });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await signUp(
        { email: parsed.data.email, password: parsed.data.password, fullName: parsed.data.fullName },
        parsed.data.role
      );
      setSubmitted(true);
      toast.success("Account created. Check your email to confirm.");
    } catch (err: any) {
      const message = err?.message ?? "Sign up failed";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-lg">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Create access</p>
          <h1 className="text-3xl font-bold text-slate-900">Invite a teammate</h1>
          <p className="text-sm text-slate-600">Provision the correct role on day one.</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Dr. Priya Singh"
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@hospital.org"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-50"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as any }))}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-rose-600">{errors.role}</p>}
          </div>

          {errors.form && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errors.form}
            </div>
          )}
          {submitted && !errors.form && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Check your inbox to verify the account.
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already onboarded?{" "}
          <Link href="/signin" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
