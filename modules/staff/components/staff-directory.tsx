import { listStaff } from "../queries";
import StaffTable from "./staff-table";

export default async function StaffDirectory() {
  const staff = await listStaff();

  return (
    <div className="space-y-4">
      <StaffTable data={staff} />
    </div>
  );
}
