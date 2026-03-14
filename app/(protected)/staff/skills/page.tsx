import SkillMatrix from "@/modules/staff/components/skill-matrix";
import { PageHeader } from "@/components/ui/page-header";

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <PageHeader badge="Competencies" title="Skill Matrix" description="Cross-reference staff against skills and certifications." />
      <SkillMatrix />
    </div>
  );
}
