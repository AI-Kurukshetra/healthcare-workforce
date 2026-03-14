import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function loadStats() {
  try {
    const supabase = createSupabaseServerClient();
    const [{ count: staffCount }, { count: shiftCount }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("shifts").select("id", { count: "exact", head: true }),
    ]);
    return { staffCount: staffCount ?? 0, shiftCount: shiftCount ?? 0 };
  } catch (error) {
    console.error("overview load failed", error);
    return { staffCount: 0, shiftCount: 0 };
  }
}

const colorRing = ["border-brand-200 bg-brand-50", "border-slate-200 bg-white", "border-slate-200 bg-white"];

export default async function OverviewCards() {
  const stats = await loadStats();
  const cards = [
    { label: "Active staff", value: stats.staffCount, hint: "Licensed & onboarded" },
    { label: "Shifts this week", value: stats.shiftCount, hint: "Scheduled across all units" },
    { label: "Swap requests", value: "Realtime", hint: "Live channel updates" },
    { label: "Pending time off", value: "Queue", hint: "Awaiting approval" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.label} className={`border ${colorRing[index % colorRing.length]}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{card.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
            <p className="text-xs text-slate-500">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
