"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Clock, User, MapPin } from "lucide-react";

type Shift = {
  id: string;
  start_at: string;
  end_at: string;
  staff_id: string | null;
  unit_id: string;
  status: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = dayjs().startOf("week").add(weekOffset, "week");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    setLoading(true);

    supabase
      .from("shifts")
      .select("id, start_at, end_at, staff_id, unit_id, status")
      .gte("start_at", weekStart.toISOString())
      .lte("end_at", weekStart.add(7, "day").toISOString())
      .order("start_at")
      .then(({ data, error }) => {
        if (error) console.error(error.message);
        setShifts(data ?? []);
        setLoading(false);
      });
  }, [weekOffset]);

  const getShiftsForDay = (dayIndex: number) => {
    const dayStart = weekStart.add(dayIndex, "day");
    const dayEnd = dayStart.add(1, "day");
    return shifts.filter(
      (s) => dayjs(s.start_at).isBefore(dayEnd) && dayjs(s.end_at).isAfter(dayStart)
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Previous
        </button>
        <h3 className="text-sm font-semibold text-slate-800">
          {weekStart.format("MMM D")} – {weekStart.add(6, "day").format("MMM D, YYYY")}
        </h3>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, dayIndex) => {
          const dayShifts = getShiftsForDay(dayIndex);
          const dayDate = weekStart.add(dayIndex, "day");
          const isToday = dayDate.isSame(dayjs(), "day");

          return (
            <div
              key={day}
              className={`min-h-[180px] rounded-xl border p-2 ${
                isToday ? "border-brand-300 bg-brand-50/30" : "border-border bg-white"
              }`}
            >
              <div className="mb-2 text-center">
                <p className="text-xs font-semibold uppercase text-slate-500">{day}</p>
                <p className={`text-lg font-bold ${isToday ? "text-brand-700" : "text-slate-800"}`}>
                  {dayDate.format("D")}
                </p>
              </div>
              <div className="space-y-1">
                {dayShifts.length === 0 && (
                  <p className="text-center text-xs text-slate-400 mt-4">No shifts</p>
                )}
                {dayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={`rounded-lg p-1.5 text-xs ${
                      shift.staff_id
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border border-amber-200 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-semibold">
                        {dayjs(shift.start_at).format("HH:mm")}–{dayjs(shift.end_at).format("HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3" />
                      <span>{shift.staff_id ? "Assigned" : "Open"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
