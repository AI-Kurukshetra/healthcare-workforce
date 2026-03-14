"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User } from "lucide-react";

type Shift = {
  id: string;
  start_at: string;
  end_at: string;
  staff_id: string | null;
  unit_id: string;
  status: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleCalendar({
  scope = "all",
  viewerId = null,
}: {
  scope?: "all" | "self";
  viewerId?: string | null;
}) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = dayjs().startOf("week").add(weekOffset, "week");

  useEffect(() => {
    const currentWeekStart = dayjs().startOf("week").add(weekOffset, "week");
    setLoading(true);
    const query = new URLSearchParams({
      scope,
      from: currentWeekStart.toISOString(),
      to: currentWeekStart.add(7, "day").toISOString(),
    });

    if (scope === "self" && !viewerId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    fetch(`/api/shifts?${query.toString()}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load shifts");
        }

        return response.json();
      })
      .then((data: Shift[]) => {
        setShifts(data ?? []);
      })
      .catch((error: Error) => {
        console.error(error.message);
        setShifts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scope, viewerId, weekOffset]);

  const getShiftsForDay = (dayIndex: number) => {
    const dayStart = weekStart.add(dayIndex, "day");
    const dayEnd = dayStart.add(1, "day");
    return shifts.filter((shift) => dayjs(shift.start_at).isBefore(dayEnd) && dayjs(shift.end_at).isAfter(dayStart));
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((offset) => offset - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Previous
        </button>
        <h3 className="text-sm font-semibold text-slate-800">
          {weekStart.format("MMM D")} - {weekStart.add(6, "day").format("MMM D, YYYY")}
        </h3>
        <button
          onClick={() => setWeekOffset((offset) => offset + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Next
        </button>
      </div>

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
                {dayShifts.length === 0 && <p className="mt-4 text-center text-xs text-slate-400">No shifts</p>}
                {dayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={`rounded-lg border p-1.5 text-xs ${
                      shift.staff_id
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-semibold">
                        {dayjs(shift.start_at).format("HH:mm")}-{dayjs(shift.end_at).format("HH:mm")}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
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
