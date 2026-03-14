"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clockIn, clockOut } from "../actions";

export default function ClockWidget() {
  const [loading, setLoading] = useState(false);
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("time_entries")
      .select("id, clock_out")
      .eq("staff_id", supabase.auth.getSession().then(({ data }) => data.session?.user.id ?? ""))
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .then(({ data }) => setOpenEntry(data?.[0]?.id ?? null));
  }, []);

  const handleClock = async () => {
    setLoading(true);
    if (openEntry) {
      await clockOut(openEntry);
      setOpenEntry(null);
    } else {
      const id = await clockIn();
      setOpenEntry(id);
    }
    setLoading(false);
  };

  return (
    <div className="rounded border p-4 bg-white">
      <div className="text-lg font-semibold">{openEntry ? "On the clock" : "Off the clock"}</div>
      <button
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={handleClock}
        disabled={loading}
      >
        {loading ? "Working..." : openEntry ? "Clock Out" : "Clock In"}
      </button>
    </div>
  );
}
