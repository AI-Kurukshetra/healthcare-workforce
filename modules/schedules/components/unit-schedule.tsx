"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type Shift = {
  id: string;
  start_at: string;
  end_at: string;
  staff_id: string | null;
  unit_id: string;
};

export default function UnitSchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("shifts")
          .select("id, start_at, end_at, staff_id, unit_id")
          .gte("start_at", dayjs().startOf("week").toISOString())
          .lte("end_at", dayjs().endOf("week").toISOString());
        if (error) throw error;
        setShifts(data ?? []);
      } catch (err: any) {
        const message =
          err?.code === "PGRST205"
            ? "Database table 'shifts' is missing. Run migrations or create it to view schedules."
            : err?.message ?? "Unable to load schedule";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();

    const channel = supabase
      .channel("shifts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setShifts((prev) => prev.filter((s) => s.id !== payload.old.id));
          } else {
            setShifts((prev) => {
              const filtered = prev.filter((s) => s.id !== payload.new.id);
              return [...filtered, payload.new as Shift];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Unable to load schedule" description={error} />;
  }

  if (shifts.length === 0) {
    return <EmptyState title="No shifts scheduled this week" description="Once assignments are published they will appear here." />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shifts.map((shift) => (
        <div key={shift.id} className="rounded-xl border border-border bg-white p-3 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {dayjs(shift.start_at).format("ddd, MMM D")}
          </div>
          <div className="text-lg font-bold text-slate-900">
            {dayjs(shift.start_at).format("HH:mm")} - {dayjs(shift.end_at).format("HH:mm")}
          </div>
          <div className="text-sm text-slate-600">
            {shift.staff_id ? `Assigned: ${shift.staff_id}` : "Unassigned"}
          </div>
          <div className="text-xs text-slate-500">Unit: {shift.unit_id}</div>
        </div>
      ))}
    </div>
  );
}
