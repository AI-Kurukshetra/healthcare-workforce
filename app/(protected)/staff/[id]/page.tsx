import StaffProfile from "@/modules/staff/components/staff-profile";

export default function StaffDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <StaffProfile id={params.id} />
    </div>
  );
}
