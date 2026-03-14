"use client";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { requestTimeOff } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TimeOffForm() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState("vacation");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const schema = z.object({
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      type: z.string().min(3),
    });
    const parsed = schema.safeParse({ startDate: start, endDate: end, type });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await requestTimeOff(parsed.data);
      toast.success("Request submitted for review");
      setStart("");
      setEnd("");
      setType("vacation");
    } catch (err: any) {
      const message = err?.message ?? "Unable to submit request";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="start">Start</Label>
          <Input
            id="start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            aria-invalid={Boolean(errors.startDate)}
          />
          {errors.startDate && <p className="text-xs text-rose-600">{errors.startDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">End</Label>
          <Input
            id="end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={Boolean(errors.endDate)}
          />
          {errors.endDate && <p className="text-xs text-rose-600">{errors.endDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-50"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick</option>
            <option value="training">Training</option>
          </select>
        </div>
      </div>

      {errors.form && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errors.form}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={submit} loading={loading} disabled={loading}>
          Submit request
        </Button>
      </div>
    </div>
  );
}
