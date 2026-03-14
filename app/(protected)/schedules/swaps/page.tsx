import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SwapRequestsTable from "@/modules/shift-swaps/components/swap-requests-table";

export default function SwapsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Shift management"
        title="Shift Swap Requests"
        description="Review, approve, or decline shift swap requests."
      />
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SwapRequestsTable isManager />
        </CardContent>
      </Card>
    </div>
  );
}
