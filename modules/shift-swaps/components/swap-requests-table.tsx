"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { decideSwap } from "../actions";
import { showSuccess, showError } from "@/lib/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Check, X, ArrowRightLeft } from "lucide-react";
import dayjs from "dayjs";

type SwapRow = {
  id: string;
  shift_id: string;
  from_staff_id: string;
  to_staff_id: string;
  status: string;
  reason: string | null;
  created_at: string;
};

export default function SwapRequestsTable({ isManager = false }: { isManager?: boolean }) {
  const [rows, setRows] = useState<SwapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [decidedBy, setDecidedBy] = useState<string>("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setDecidedBy(data.session?.user?.id ?? "");
    });

    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id;
      let query = supabase
        .from("swap_requests")
        .select("id, shift_id, from_staff_id, to_staff_id, status, reason, created_at")
        .order("created_at", { ascending: false });

      if (!isManager && userId) {
        query = query.or(`from_staff_id.eq.${userId},to_staff_id.eq.${userId}`);
      }

      query.then(({ data, error }) => {
        if (error) console.error(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
    });
  }, []);

  const handleDecide = async (id: string, status: "approved" | "declined") => {
    try {
      await decideSwap(id, status, decidedBy);
      showSuccess(`Swap request ${status}`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: any) {
      showError(err.message ?? "Unable to update swap request");
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="No swap requests" description="Shift swap requests will appear here." />;
  }

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    declined: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Reason</th>
            {isManager && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-brand-50/40">
              <td className="p-3 text-slate-700">{dayjs(row.created_at).format("MMM D, YYYY")}</td>
              <td className="p-3">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge[row.status] ?? ""}`}>
                  {row.status}
                </span>
              </td>
              <td className="p-3 text-slate-600">{row.reason ?? "—"}</td>
              {isManager && row.status === "pending" && (
                <td className="p-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDecide(row.id, "approved")}
                      className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDecide(row.id, "declined")}
                      className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
              {isManager && row.status !== "pending" && <td className="p-3" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
