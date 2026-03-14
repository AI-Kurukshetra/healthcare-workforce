import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSkillMatrix } from "../queries";
import { StaffSkill } from "../types";

const levelTone: Record<string, string> = {
  novice: "bg-slate-50 text-slate-700 border border-slate-200",
  intermediate: "bg-brand-50 text-brand-800 border border-brand-100",
  advanced: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  expert: "bg-indigo-50 text-indigo-800 border border-indigo-100",
};

function SkillCell({ skill, staffSkills }: { skill: { id: string; name: string }; staffSkills: StaffSkill[] }) {
  const match = staffSkills.find((s) => s.id === skill.id);
  if (!match) return <span className="text-xs text-slate-400">-</span>;

  const tone = (match.level && levelTone[match.level]) || levelTone.intermediate;
  return (
    <div className={`inline-flex flex-col rounded-lg px-3 py-2 text-[11px] font-semibold ${tone}`}>
      <span>{match.level ?? "unknown"}</span>
      {match.expires_at && <span className="text-[10px] text-slate-600">exp {match.expires_at}</span>}
    </div>
  );
}

export default async function SkillMatrix() {
  const matrix = await getSkillMatrix();
  const skills = matrix.skills;
  const staff = matrix.staff;

  return (
    <Card className="shadow-glass">
      <CardHeader>
        <CardTitle>Skill Matrix</CardTitle>
        <CardDescription>Cross-reference roles and competencies to spot coverage gaps.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {staff.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-slate-600">
            No staff skills recorded yet. Add skills to staff profiles to populate this matrix.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3 text-left">Staff</th>
                {skills.map((skill) => (
                  <th key={skill.id} className="p-3 text-left">
                    <div className="text-slate-900">{skill.name}</div>
                    {skill.category && <div className="text-[11px] text-slate-500">{skill.category}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((person) => (
                <tr key={person.id} className="hover:bg-brand-50/40">
                  <td className="whitespace-nowrap p-3 font-semibold text-slate-900">
                    <div>{person.name}</div>
                    <div className="text-xs text-slate-500">
                      {person.title ?? person.role} {person.shift_preference ? `· ${person.shift_preference}` : ""}
                    </div>
                  </td>
                  {skills.map((skill) => (
                    <td key={skill.id} className="p-3">
                      <SkillCell skill={skill} staffSkills={person.skills} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
