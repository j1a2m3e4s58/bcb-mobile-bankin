import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatGHS } from "@/lib/formatters";
import { useAuthStore } from "@/store/auth-store";
import { useBankStore } from "@/store/bank-store";
import { AlertTriangle, ClipboardCheck, FileText, Headphones, Landmark, ShieldCheck, UserRoundCheck } from "lucide-react";
import { motion } from "motion/react";

const SUPPORT_TICKETS = [
  {
    id: "SUP-1042",
    customer: "Ama Asante",
    subject: "Unable to download receipt",
    status: "Open",
    priority: "Normal",
  },
  {
    id: "SUP-1041",
    customer: "Kojo Mensah",
    subject: "Card replacement request",
    status: "Pending",
    priority: "High",
  },
];

const DISPUTES = [
  {
    id: "DSP-3011",
    reference: "MOMO-20260413-452",
    customer: "Kofi Mensah",
    reason: "Recipient did not receive funds",
    status: "Under Review",
  },
  {
    id: "DSP-3008",
    reference: "ECG-20260414-889",
    customer: "Akosua Frimpong",
    reason: "Duplicate payment",
    status: "Open",
  },
];

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}

export default function AdminPage() {
  const applications = useAuthStore((state) => state.accountApplications);
  const user = useAuthStore((state) => state.user);
  const loans = useBankStore((state) => state.loans);
  const transactions = useBankStore((state) => state.transactions);
  const pendingApplications = applications.filter((item) => item.status === "pending_review");

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Back Office" showBack showNotifications={false} />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-3xl p-5 text-primary-foreground bcb-card-gradient">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">Staff Review</p>
          <h1 className="mt-2 font-display text-2xl font-bold">Admin Panel</h1>
          <p className="mt-1 text-sm opacity-85">Review onboarding, loans, support, disputes, and KYC status.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Applications" value={String(applications.length)} icon={<UserRoundCheck className="h-4 w-4" />} />
          <StatCard label="Loans" value={String(loans.length)} icon={<Landmark className="h-4 w-4" />} />
          <StatCard label="Tickets" value={String(SUPPORT_TICKETS.length)} icon={<Headphones className="h-4 w-4" />} />
          <StatCard label="Disputes" value={String(DISPUTES.length)} icon={<AlertTriangle className="h-4 w-4" />} />
        </div>

        <ReviewSection title="New Account Applications" icon={<ClipboardCheck className="h-5 w-5" />}>
          {pendingApplications.length === 0 ? (
            <div className="rounded-2xl border border-border p-3 text-sm text-muted-foreground">
              No pending applications yet. New registrations will appear here.
            </div>
          ) : (
            pendingApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{application.fullName}</p>
                    <p className="text-xs text-muted-foreground">{application.accountType} | {application.branch}</p>
                  </div>
                  <Badge className="border-0 bg-accent/15 text-accent-foreground">Pending</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Ghana Card: {application.ghanaCard}</span>
                  <span>Phone: {application.phone}</span>
                  <span>DOB: {application.dateOfBirth}</span>
                  <span>Submitted: {formatDate(application.submittedAt)}</span>
                </div>
              </div>
            ))
          )}
        </ReviewSection>

        <ReviewSection title="Loan Applications" icon={<Landmark className="h-5 w-5" />}>
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{loan.type}</p>
                <Badge variant="outline" className="capitalize">{loan.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Amount: {formatGHS(loan.amount)} | Outstanding: {formatGHS(loan.outstanding)}</p>
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Support Tickets" icon={<Headphones className="h-5 w-5" />}>
          {SUPPORT_TICKETS.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.id} | {ticket.customer}</p>
                </div>
                <Badge variant="outline">{ticket.status}</Badge>
              </div>
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Disputed Transactions" icon={<AlertTriangle className="h-5 w-5" />}>
          {DISPUTES.map((dispute) => (
            <div key={dispute.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{dispute.reason}</p>
                  <p className="text-xs text-muted-foreground">{dispute.reference} | {dispute.customer}</p>
                </div>
                <Badge className="border-0 bg-destructive/10 text-destructive">{dispute.status}</Badge>
              </div>
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Customer KYC Status" icon={<ShieldCheck className="h-5 w-5" />}>
          <div className="rounded-2xl border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name ?? "Demo Customer"}</p>
                <p className="text-xs text-muted-foreground">{user?.accountNumber ?? "1234567890"} | {user?.branch ?? "Bawjiase Market Branch"}</p>
              </div>
              <Badge className={user?.kycVerified ? "border-0 bg-success/10 text-success" : "border-0 bg-accent/15 text-accent-foreground"}>
                {user?.kycVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </ReviewSection>

        <ReviewSection title="Recent Transactions for Review" icon={<FileText className="h-5 w-5" />}>
          {transactions.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="rounded-2xl border border-border p-3">
              <p className="text-sm font-semibold text-foreground">{transaction.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{transaction.reference} | {formatGHS(transaction.amount)} | {transaction.status}</p>
            </div>
          ))}
        </ReviewSection>
      </div>
    </div>
  );
}
