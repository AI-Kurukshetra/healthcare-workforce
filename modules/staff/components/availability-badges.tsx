"use client";
import { AvailabilityDay } from "../types";

const dayLabel: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function AvailabilityBadges({ availability }: { availability: AvailabilityDay[] }) {
  if (!availability?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {availability.map((slot) => (
        <span
          key={slot.day}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-semibold text-slate-700"
        >
          {dayLabel[slot.day] ?? slot.day}
          <span className="text-[11px] text-slate-500">
            {slot.ranges?.map((r) => `${r.start}-${r.end}`).join(", ")}
          </span>
        </span>
      ))}
    </div>
  );
}
