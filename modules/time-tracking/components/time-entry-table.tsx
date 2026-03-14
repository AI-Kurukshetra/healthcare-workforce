import dayjs from "dayjs";
import { listTimeEntries } from "../queries";
import { getSessionWithRole } from "@/modules/auth/queries";

type Scope = "self" | "team" | "all";

export default async function TimeEntryTable({ scope = "self" }: { scope?: Scope }) {
  const session = await getSessionWithRole();
  const userId = session?.session?.user.id;

  if (scope === "self" && !userId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-sm text-slate-600">
        Unable to load entries for your account.
      </div>
    );
  }

  const rows =
    scope === "self" && userId ? await listTimeEntries(userId) : await listTimeEntries();

  return (
    <div className="overflow-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Clock In</th>
            <th className="p-3 text-left">Clock Out</th>
            <th className="p-3 text-left">Method</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-3">{dayjs(row.clock_in).format("MMM D, HH:mm")}</td>
              <td className="p-3">
                {row.clock_out ? dayjs(row.clock_out).format("MMM D, HH:mm") : "--"}
              </td>
              <td className="p-3 capitalize">{row.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
