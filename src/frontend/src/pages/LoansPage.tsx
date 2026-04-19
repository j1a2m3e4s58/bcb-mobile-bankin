import { AppBar } from "@/components/layout/AppBar";
import { PinConfirmDialog } from "@/components/PinConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  Home,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoanType {
  id: string;
  name: string;
  rate: string;
  icon: React.ReactNode;
  color: string;
}

type ScheduleStatus = "paid" | "upcoming" | "overdue";

interface ScheduleRow {
  num: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  status: ScheduleStatus;
}

interface ApplicationFormData {
  loanType: string;
  amount: number;
  tenure: number;
  purpose: string;
  employmentStatus: string;
  monthlyIncome: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_LOAN = {
  id: "loan001",
  type: "Personal Loan",
  amount: 5000,
  status: "approved" as const,
  interestRate: 18,
  tenure: 12,
  monthlyPayment: 458.33,
  disbursementDate: "2026-02-01",
  applicationDate: "2026-01-25",
  paidInstallments: 3,
  totalInstallments: 12,
};

const LOAN_TYPES: LoanType[] = [
  {
    id: "personal",
    name: "Personal Loan",
    rate: "18% p.a.",
    icon: <User className="w-5 h-5" />,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "business",
    name: "Business Loan",
    rate: "15% p.a.",
    icon: <Briefcase className="w-5 h-5" />,
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    id: "home",
    name: "Home Loan",
    rate: "12% p.a.",
    icon: <Home className="w-5 h-5" />,
    color: "bg-secondary/10 text-secondary",
  },
  {
    id: "education",
    name: "Education Loan",
    rate: "10% p.a.",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "bg-success/10 text-success",
  },
];

const TENURE_OPTIONS = [6, 12, 18, 24, 36];
const PURPOSE_OPTIONS = [
  "Medical",
  "Education",
  "Business",
  "Travel",
  "Home Improvement",
  "Other",
];
const EMPLOYMENT_OPTIONS = [
  "Employed (Full-time)",
  "Employed (Part-time)",
  "Self-employed",
  "Business Owner",
  "Unemployed",
  "Retired",
];

const RATE_MAP: Record<string, number> = {
  personal: 18,
  business: 15,
  home: 12,
  education: 10,
};

function generateSchedule(): ScheduleRow[] {
  const base = new Date("2026-02-01");
  return Array.from({ length: 12 }, (_, i) => {
    const due = new Date(base);
    due.setMonth(due.getMonth() + i + 1);
    return {
      num: i + 1,
      dueDate: due.toISOString().slice(0, 10),
      principal: 366.67,
      interest: 75.0,
      total: 458.33,
      status: (i < 3 ? "paid" : "upcoming") as ScheduleStatus,
    };
  });
}

const SCHEDULE = generateSchedule();

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
  value,
  className,
}: { value: number; className?: string }) {
  return (
    <div
      className={cn(
        "h-2 bg-primary-foreground/20 rounded-full overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="h-full bg-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-success/15 text-success border-success/20",
    upcoming: "bg-muted text-muted-foreground border-border",
    overdue: "bg-destructive/15 text-destructive border-destructive/20",
    approved: "bg-success/15 text-success border-success/20",
    active: "bg-primary/15 text-primary border-primary/20",
    pending: "bg-accent/15 text-accent-foreground border-accent/20",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap",
        styles[status] ?? styles.upcoming,
      )}
    >
      {status}
    </span>
  );
}

// ─── Repayment Schedule ───────────────────────────────────────────────────────

function RepaymentSchedule() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <button
        type="button"
        data-ocid="loans.schedule_toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-smooth hover:bg-muted/40"
      >
        <span className="text-sm font-semibold text-foreground font-display">
          Repayment Schedule
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {open ? "Collapse" : "View all 12"}
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="schedule"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {/* Table header */}
            <div className="grid grid-cols-[28px_1fr_52px_52px_60px_56px] gap-x-2 items-center px-4 py-2 bg-muted/40 border-t border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span>#</span>
              <span>Due Date</span>
              <span className="text-right">Princ.</span>
              <span className="text-right">Int.</span>
              <span className="text-right">Total</span>
              <span className="text-right">Status</span>
            </div>

            <div className="divide-y divide-border">
              {SCHEDULE.map((row) => (
                <div
                  key={row.num}
                  data-ocid={`loans.schedule.item.${row.num}`}
                  className={cn(
                    "grid grid-cols-[28px_1fr_52px_52px_60px_56px] gap-x-2 items-center px-4 py-2.5 text-xs",
                    row.status === "paid" && "bg-success/5",
                    row.status === "overdue" && "bg-destructive/5",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      row.status === "paid"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {row.status === "paid" ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      row.num
                    )}
                  </span>
                  <span className="text-foreground font-medium truncate">
                    {formatDate(row.dueDate)}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {row.principal.toFixed(0)}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {row.interest.toFixed(0)}
                  </span>
                  <span className="text-right font-semibold text-foreground font-display">
                    {row.total.toFixed(2)}
                  </span>
                  <span className="text-right flex justify-end">
                    <StatusPill status={row.status} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Loan Application Modal ────────────────────────────────────────────────────

function LoanApplicationModal({
  initialType,
  onClose,
}: {
  initialType: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ApplicationFormData>({
    loanType: initialType,
    amount: 10000,
    tenure: 12,
    purpose: "",
    employmentStatus: "",
    monthlyIncome: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [refNumber] = useState(
    `BCB-LN-${String(Math.floor(100000 + Math.random() * 900000))}`,
  );

  const annualRate = RATE_MAP[form.loanType] ?? 18;
  const monthlyRate = annualRate / 100 / 12;

  const emi = useMemo(() => {
    const P = form.amount;
    const r = monthlyRate;
    const n = form.tenure;
    if (r === 0) return P / n;
    return (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  }, [form.amount, form.tenure, monthlyRate]);

  const handleSubmit = () => {
    setPinOpen(true);
  };

  const handlePinConfirmed = async () => {
    setSubmitting(true);
    await new Promise<void>((res) => setTimeout(res, 1500));
    setSubmitting(false);
    setPinOpen(false);
    setSubmitted(true);
  };

  function update<K extends keyof ApplicationFormData>(
    key: K,
    val: ApplicationFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-ocid="loans.application_modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-card border-b border-border shrink-0">
        <h2 className="text-base font-semibold text-foreground font-display">
          Apply for a Loan
        </h2>
        <button
          type="button"
          data-ocid="loans.application.close_button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-smooth"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5"
              data-ocid="loans.application.success_state"
            >
              <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-display mb-1">
                  Application Submitted!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your loan application has been received and is under review.
                </p>
              </div>
              <div className="w-full bg-muted/50 rounded-xl p-4 flex flex-col gap-3 text-sm">
                {[
                  { label: "Reference Number", value: refNumber, mono: true },
                  {
                    label: "Processing Time",
                    value: "2–3 business days",
                    mono: false,
                  },
                  {
                    label: "Amount Applied",
                    value: formatGHS(form.amount),
                    mono: false,
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span
                      className={cn(
                        "font-semibold text-foreground",
                        mono && "font-mono",
                      )}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full h-12 text-base"
                onClick={onClose}
                data-ocid="loans.application.done_button"
              >
                Back to Loans
              </Button>
            </motion.div>
          ) : (
            /* Application Form */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pt-5 flex flex-col gap-5"
            >
              {/* Loan Type */}
              <div>
                <p className="block text-sm font-semibold text-foreground font-display mb-2">
                  Loan Type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LOAN_TYPES.map((lt) => (
                    <button
                      key={lt.id}
                      type="button"
                      data-ocid={`loans.application.type.${lt.id}`}
                      onClick={() => update("loanType", lt.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-smooth",
                        form.loanType === lt.id
                          ? "border-primary bg-primary/8 shadow-sm"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                          lt.color,
                        )}
                      >
                        {lt.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight">
                          {lt.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {lt.rate}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="loan-amount-slider"
                    className="text-sm font-semibold text-foreground font-display"
                  >
                    Loan Amount
                  </label>
                  <span className="text-sm font-bold text-primary font-display">
                    {formatGHS(form.amount)}
                  </span>
                </div>
                <input
                  id="loan-amount-slider"
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={form.amount}
                  data-ocid="loans.application.amount_slider"
                  onChange={(e) => update("amount", Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "oklch(var(--primary))" }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>GHS 500</span>
                  <span>GHS 50,000</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <p className="block text-sm font-semibold text-foreground font-display mb-2">
                  Repayment Period
                </p>
                <div className="flex gap-2 flex-wrap">
                  {TENURE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      data-ocid={`loans.application.tenure.${t}`}
                      onClick={() => update("tenure", t)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-smooth",
                        form.tenure === t
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-primary/50",
                      )}
                    >
                      {t} months
                    </button>
                  ))}
                </div>
              </div>

              {/* EMI Calculator */}
              <div className="bcb-card-gradient rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary-foreground/70">
                    Estimated Monthly Payment
                  </p>
                  <p className="text-2xl font-bold text-primary-foreground font-display mt-0.5">
                    {formatGHS(emi)}
                  </p>
                  <p className="text-[10px] text-primary-foreground/60 mt-0.5">
                    at {annualRate}% p.a. for {form.tenure} months
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <TrendingUp className="w-6 h-6 text-primary-foreground/60" />
                  <p className="text-[10px] text-primary-foreground/60">
                    Total: {formatGHS(emi * form.tenure)}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label
                  htmlFor="loan-purpose"
                  className="block text-sm font-semibold text-foreground font-display mb-2"
                >
                  Purpose of Loan
                </label>
                <select
                  id="loan-purpose"
                  value={form.purpose}
                  data-ocid="loans.application.purpose_select"
                  onChange={(e) => update("purpose", e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                >
                  <option value="" disabled>
                    Select purpose...
                  </option>
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Status */}
              <div>
                <label
                  htmlFor="loan-employment"
                  className="block text-sm font-semibold text-foreground font-display mb-2"
                >
                  Employment Status
                </label>
                <select
                  id="loan-employment"
                  value={form.employmentStatus}
                  data-ocid="loans.application.employment_select"
                  onChange={(e) => update("employmentStatus", e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                >
                  <option value="" disabled>
                    Select status...
                  </option>
                  {EMPLOYMENT_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Income */}
              <div>
                <label
                  htmlFor="loan-income"
                  className="block text-sm font-semibold text-foreground font-display mb-2"
                >
                  Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold pointer-events-none">
                    GHS
                  </span>
                  <input
                    id="loan-income"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={form.monthlyIncome}
                    data-ocid="loans.application.income_input"
                    onChange={(e) => update("monthlyIncome", e.target.value)}
                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full h-12 text-base font-semibold mt-1"
                disabled={
                  submitting ||
                  !form.purpose ||
                  !form.employmentStatus ||
                  !form.monthlyIncome
                }
                onClick={handleSubmit}
                data-ocid="loans.application.submit_button"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="inline-block w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 0.8,
                        ease: "linear",
                      }}
                    />
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PinConfirmDialog
        open={pinOpen}
        title="Confirm Loan Application"
        description="Enter your 4-digit PIN to submit this loan application."
        confirmLabel="Submit Application"
        busy={submitting}
        onOpenChange={setPinOpen}
        onConfirm={handlePinConfirmed}
      />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoansPage() {
  const loan = SAMPLE_LOAN;
  const paidPercent = (loan.paidInstallments / loan.totalInstallments) * 100;
  const [applyType, setApplyType] = useState<string | null>(null);

  return (
    <div
      className="flex flex-col min-h-full bg-background"
      data-ocid="loans.page"
    >
      <AppBar title="Loans" showBack />

      <div className="px-4 pt-4 pb-24 flex flex-col gap-4">
        {/* My Loans Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          data-ocid="loans.my_loans_section"
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            My Loans
          </h2>

          {/* Loan Card */}
          <div className="bcb-card-gradient rounded-2xl p-5 shadow-elevated relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-primary-foreground/5 pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-primary-foreground/5 pointer-events-none" />

            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-primary-foreground/70 font-medium">
                  {loan.type}
                </p>
                <Badge
                  data-ocid="loans.status_badge"
                  className="uppercase text-[10px] bg-success/25 text-success border border-success/40 hover:bg-success/25 shadow-none"
                >
                  {loan.status}
                </Badge>
              </div>

              {/* Amount */}
              <p className="text-3xl font-bold text-primary-foreground font-display mb-0.5">
                {formatGHS(loan.amount)}
              </p>
              <p className="text-xs text-primary-foreground/60 mb-4">
                Loan Amount
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Interest", value: `${loan.interestRate}% p.a.` },
                  { label: "Tenure", value: `${loan.tenure} months` },
                  {
                    label: "Monthly EMI",
                    value: formatGHS(loan.monthlyPayment),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-primary-foreground/10 rounded-xl px-2 py-2"
                  >
                    <p className="text-[10px] text-primary-foreground/60 mb-0.5">
                      {label}
                    </p>
                    <p className="text-xs font-bold text-primary-foreground font-display leading-tight">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="flex justify-between text-xs text-primary-foreground/70 mb-3">
                <span>Disbursed: {formatDate(loan.disbursementDate)}</span>
                <span>Applied: {formatDate(loan.applicationDate)}</span>
              </div>

              {/* Progress */}
              <div className="flex justify-between text-xs text-primary-foreground/70 mb-1.5">
                <span>
                  {loan.paidInstallments} of {loan.totalInstallments} payments
                  made
                </span>
                <span>{Math.round(paidPercent)}%</span>
              </div>
              <ProgressBar value={paidPercent} />
            </div>
          </div>
        </motion.section>

        {/* Repayment Schedule */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          data-ocid="loans.schedule_section"
        >
          <RepaymentSchedule />
        </motion.section>

        {/* Apply for Loan Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          data-ocid="loans.apply_section"
        >
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Need a Loan?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LOAN_TYPES.map((lt, i) => (
              <motion.div
                key={lt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                data-ocid={`loans.type_card.${i + 1}`}
                className="bg-card rounded-2xl p-4 shadow-card flex flex-col gap-3 border border-border"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    lt.color,
                  )}
                >
                  {lt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground font-display leading-tight">
                    {lt.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From {lt.rate}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  data-ocid={`loans.apply_button.${i + 1}`}
                  onClick={() => setApplyType(lt.id)}
                >
                  Apply
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Make a Payment CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            className="w-full h-12 text-base font-semibold shadow-elevated"
            data-ocid="loans.pay_now_button"
          >
            Make a Payment
          </Button>
        </motion.div>
      </div>

      {/* Loan Application Modal */}
      <AnimatePresence>
        {applyType !== null && (
          <LoanApplicationModal
            initialType={applyType}
            onClose={() => setApplyType(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
