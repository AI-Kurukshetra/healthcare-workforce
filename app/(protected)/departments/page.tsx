import { PageHeader } from "@/components/ui/page-header";
import DepartmentsList from "@/modules/departments/components/departments-list";
import DepartmentForm from "@/modules/departments/components/department-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleGuard from "@/components/auth/role-guard";

export default function DepartmentsPage() {
  return (
    <RoleGuard roles={["admin"]}>
      <div className="space-y-6">
        <PageHeader
          badge="Organization"
          title="Departments & Units"
          description="Manage your organizational structure — departments, units, and staff assignments."
        />
        <Card>
          <CardHeader>
            <CardTitle>Add Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DepartmentForm />
          </CardContent>
        </Card>
        <DepartmentsList />
      </div>
    </RoleGuard>
  );
}
