import { listStaff } from "../queries";
import StaffTable from "./staff-table";

export default async function StaffDirectory({ canManage }: { canManage: boolean }) {
  const staff = await listStaff();

  return (
    <div className="space-y-4">
      <StaffTable data={staff} canManage={canManage} />
    </div>
  );
}
