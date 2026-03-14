import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveTimeOff, declineTimeOff } from "@/modules/timeoff/actions";

export default function TimeOffDecisionActions({ requestId }: { requestId: string }) {
  const approveAction = approveTimeOff.bind(null, requestId);
  const declineAction = declineTimeOff.bind(null, requestId);

  return (
    <div className="flex items-center gap-2">
      <form action={approveAction}>
        <Button type="submit" size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Check className="h-4 w-4 shrink-0 text-current" aria-hidden />
          Approve
        </Button>
      </form>
      <form action={declineAction}>
        <Button type="submit" size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
          <X className="h-4 w-4 shrink-0 text-current" aria-hidden />
          Decline
        </Button>
      </form>
    </div>
  );
}
