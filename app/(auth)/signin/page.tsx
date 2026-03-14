"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { signIn } from "@/modules/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse({ email, password });
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
      await signIn(parsed.data);
      toast.success("Signed in successfully");
      const next = searchParams.get("redirect") ?? "/dashboard";
      router.push(next);
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
      setErrors({ form: err?.message ?? "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-lg">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Secure sign in</p>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">Use your organizational email to access the console.</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
        </div>

        {errors.form && (
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errors.form}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          Request access
        </Link>
      </p>
    </div>
  );
}

import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<p>Loading...</p>}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
