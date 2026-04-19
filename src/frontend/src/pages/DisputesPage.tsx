import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { formatGHS } from "@/lib/formatters";
import { useBankStore } from "@/store/bank-store";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const statusCopy = {
  open: { label: "Open", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  under_review: { label: "Under Review", icon: Clock, className: "bg-accent/15 text-accent-foreground" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "bg-success/10 text-success" },
} as const;

export default function DisputesPage() {
  const disputes = useBankStore((state) => state.disputes);

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Dispute Tracking" showBack showNotifications={false} />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
          <h1 className="font-display text-xl font-bold text-foreground">Reported Issues</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track disputes submitted from transaction receipts and details.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-card">
            <p className="font-display text-base font-semibold text-foreground">No disputes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Report an issue from any transaction to see it here.</p>
          </div>
        ) : (
          disputes.map((dispute) => {
            const status = statusCopy[dispute.status];
            const Icon = status.icon;
            return (
              <div key={dispute.id} className="rounded-3xl bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dispute.transactionTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{dispute.id} | {dispute.reference}</p>
                  </div>
                  <Badge className={`border-0 ${status.className}`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
                <div className="mt-3 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Reason:</span> {dispute.reason}</p>
                  <p className="mt-1"><span className="font-semibold text-foreground">Amount:</span> {formatGHS(dispute.amount)}</p>
                  {dispute.note && <p className="mt-1"><span className="font-semibold text-foreground">Note:</span> {dispute.note}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
