import { AppBar } from "@/components/layout/AppBar";
import { ProfessionalReceipt } from "@/components/ProfessionalReceipt";
import { ActivityIconGlyph } from "@/lib/activity-icons";
import { downloadSimplePdf, downloadTextFile } from "@/lib/download";
import { formatDate, formatGHS } from "@/lib/formatters";
import type { Transaction, TransactionCategory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Flag,
  RefreshCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FilterChip = "all" | "transfers" | "payments" | "deposits" | "withdrawals";
type DateRange = "this_week" | "this_month" | "last_3_months" | "custom";
type StatusFilter = "all" | Transaction["status"];
type CategoryFilter = "all" | TransactionCategory;

const FILTER_CHIPS: { value: FilterChip; label: string }[] = [
  { value: "all", label: "All" },
  { value: "transfers", label: "Transfers" },
  { value: "payments", label: "Payments" },
  { value: "deposits", label: "Deposits" },
  { value: "withdrawals", label: "Withdrawals" },
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "custom", label: "Custom" },
];

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-accent bg-accent/10",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-destructive bg-destructive/10",
  },
} as const;

const CATEGORY_CONFIG: Record<
  TransactionCategory,
  { label: string; bg: string; text: string }
> = {
  transfer: { label: "Transfer", bg: "bg-primary/10", text: "text-primary" },
  payment: {
    label: "Payment",
    bg: "bg-accent/20",
    text: "text-accent-foreground",
  },
  airtime: { label: "Airtime", bg: "bg-muted", text: "text-muted-foreground" },
  momo: { label: "MoMo", bg: "bg-primary/10", text: "text-primary" },
  salary: { label: "Salary", bg: "bg-success/10", text: "text-success" },
  loan: { label: "Loan", bg: "bg-destructive/10", text: "text-destructive" },
  savings: { label: "Savings", bg: "bg-primary/10", text: "text-primary" },
};

function getDateLabel(dateStr: string): string {
  const txDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (txDate.getTime() === today.getTime()) return "Today";
  if (txDate.getTime() === yesterday.getTime()) return "Yesterday";

  return txDate.toLocaleDateString("en-GH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateRangeCutoff(range: DateRange): Date {
  const now = new Date();
  if (range === "this_week") {
    const date = new Date(now);
    date.setDate(now.getDate() - 7);
    return date;
  }
  if (range === "this_month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (range === "last_3_months") {
    const date = new Date(now);
    date.setMonth(now.getMonth() - 3);
    return date;
  }
  return new Date(0);
}

function matchesChip(txn: Transaction, chip: FilterChip): boolean {
  if (chip === "all") return true;
  if (chip === "deposits") return txn.type === "credit";
  if (chip === "withdrawals") {
    return (
      txn.type === "debit" &&
      txn.category !== "transfer" &&
      txn.category !== "payment"
    );
  }
  if (chip === "transfers") {
    return txn.category === "transfer" || txn.category === "momo";
  }
  if (chip === "payments") {
    return txn.category === "payment" || txn.category === "airtime";
  }
  return true;
}

function TxnIcon({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === "credit";
  const isTransfer = txn.category === "transfer" || txn.category === "momo";
  const isPayment = txn.category === "payment" || txn.category === "airtime";
  const ringColor = isCredit
    ? "bg-success/15 ring-success/30"
    : isTransfer
      ? "bg-primary/15 ring-primary/30"
      : isPayment
        ? "bg-accent/20 ring-accent/40"
        : "bg-destructive/10 ring-destructive/20";

  return (
    <div
      className={cn(
        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ring-2",
        ringColor,
      )}
    >
      <ActivityIconGlyph icon={txn.icon} className="h-5 w-5" />
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        config.className,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildTransactionRows(transactions: Transaction[]) {
  return transactions.map((txn) => ({
    Date: formatDate(txn.date),
    Time: txn.time,
    Reference: txn.reference,
    Type: txn.type,
    Category: CATEGORY_CONFIG[txn.category].label,
    Title: txn.title,
    Description: txn.description,
    Amount: `${txn.type === "credit" ? "" : "-"}${txn.amount.toFixed(2)}`,
    Status: txn.status,
  }));
}

function ReceiptModal({
  txn,
  onClose,
  onReport,
}: {
  txn: Transaction;
  onClose: () => void;
  onReport: (reason: string, note: string) => string;
}) {
  const [reported, setReported] = useState(false);
  const [issueReason, setIssueReason] = useState("Wrong amount");
  const [issueNote, setIssueNote] = useState("");
  const amountText = `${txn.type === "credit" ? "+" : "-"}${formatGHS(txn.amount)}`;

  const receiptRows = [
    { label: "Transaction ID", value: txn.id },
    { label: "Type", value: CATEGORY_CONFIG[txn.category].label },
    { label: "Direction", value: txn.type === "credit" ? "Credit" : "Debit" },
    {
      label: "Amount",
      value: amountText,
      tone: txn.type === "credit" ? ("success" as const) : ("danger" as const),
    },
    { label: "Status", value: txn.status.charAt(0).toUpperCase() + txn.status.slice(1) },
    { label: "Description", value: txn.description },
  ];

  const handleReportIssue = () => {
    const ticketId = onReport(issueReason, issueNote);
    setReported(true);
    toast.success("Dispute submitted", {
      description: `Ticket ${ticketId} opened for ${txn.reference}.`,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-ocid="receipt.dialog"
      >
        <motion.div
        className="w-full max-w-sm"
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={(event) => event.stopPropagation()}
      >
          <ProfessionalReceipt
            title="Transaction Receipt"
            subtitle={txn.title}
            amount={amountText}
            reference={txn.reference}
            dateTime={`${formatDate(txn.date)} at ${txn.time}`}
            rows={receiptRows}
            status={txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
          />

          <div className="mt-3 rounded-3xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-sm font-semibold text-foreground">Report a problem</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Submit a dispute from this receipt if the transaction looks wrong.
            </p>

            <select
              value={issueReason}
              onChange={(event) => setIssueReason(event.target.value)}
              className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              disabled={reported}
              data-ocid="receipt.issue_reason_select"
            >
              <option>Wrong amount</option>
              <option>Duplicate transaction</option>
              <option>Recipient did not receive funds</option>
              <option>I do not recognize this transaction</option>
            </select>

            <textarea
              value={issueNote}
              onChange={(event) => setIssueNote(event.target.value)}
              placeholder="Add a short note for support"
              className="mt-3 min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              disabled={reported}
              data-ocid="receipt.issue_note_input"
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-10 gap-2 text-xs" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
              <Button
                className="h-10 gap-2 text-xs"
                onClick={handleReportIssue}
                disabled={reported}
                data-ocid="receipt.report_issue_button"
              >
                <Flag className="h-3.5 w-3.5" />
                {reported ? "Submitted" : "Submit Dispute"}
              </Button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
}

function TransactionDetailSheet({
  txn,
  onClose,
  onReport,
}: {
  txn: Transaction;
  onClose: () => void;
  onReport: (txn: Transaction, reason: string, note: string) => string;
}) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [reported, setReported] = useState(false);
  const isCredit = txn.type === "credit";
  const categoryConfig = CATEGORY_CONFIG[txn.category];

  const detailRows: [string, string][] = [
    ["Transaction ID", txn.id],
    ["Reference No.", txn.reference],
    ["Type", isCredit ? "Credit" : "Debit"],
    ["Category", categoryConfig.label],
    ["Date", formatDate(txn.date)],
    ["Time", txn.time],
    ["Status", txn.status.charAt(0).toUpperCase() + txn.status.slice(1)],
    [isCredit ? "From" : "To", txn.description],
    ["Account", "Kofi Mensah - 1234567890"],
    ["Narration", txn.description],
  ];

  const handleReportIssue = () => {
    const ticketId = onReport(txn, "Customer reported from transaction details", "");
    setReported(true);
    toast.success("Issue reported", {
      description: `Ticket ${ticketId} opened for ${txn.reference}.`,
    });
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-ocid="transaction_detail.dialog"
      >
        <motion.div
          className="flex max-h-[90dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-3xl bg-card shadow-elevated"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="font-display text-base font-semibold text-foreground">
              Transaction Details
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-smooth hover:bg-muted/80"
              data-ocid="transaction_detail.close_button"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="mx-5 mb-4 flex flex-col items-center gap-2 rounded-2xl bg-muted/40 py-5">
            <TxnIcon txn={txn} />
            <p
              className={cn(
                "mt-1 font-display text-2xl font-bold",
                isCredit ? "text-success" : "text-destructive",
              )}
            >
              {isCredit ? "+" : "-"}
              {formatGHS(txn.amount)}
            </p>
            <p className="text-sm font-semibold text-foreground">{txn.title}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={txn.status} />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  categoryConfig.bg,
                  categoryConfig.text,
                )}
              >
                {categoryConfig.label}
              </span>
            </div>
          </div>

          <div className="scrollbar-hide flex-1 divide-y divide-border/60 overflow-y-auto px-5">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
                <span className="break-all text-right text-xs font-medium text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 px-5 pb-6 pt-4">
            <Button
              className="h-12 w-full gap-2"
              onClick={() => setShowReceipt(true)}
              data-ocid="transaction_detail.download_receipt_button"
            >
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full gap-2 text-destructive hover:text-destructive"
              onClick={handleReportIssue}
              disabled={reported}
              data-ocid="transaction_detail.report_issue_button"
            >
              <Flag className="h-4 w-4" />
              {reported ? "Issue Reported" : "Report an Issue"}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showReceipt && (
          <ReceiptModal
            txn={txn}
            onClose={() => setShowReceipt(false)}
            onReport={(reason, note) => onReport(txn, reason, note)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function TransactionsPage() {
  const transactions = useBankStore((state) => state.transactions);
  const reportDispute = useBankStore((state) => state.reportDispute);
  const [filter, setFilter] = useState<FilterChip>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last_3_months");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [search, setSearch] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const currentDateLabel =
    DATE_RANGES.find((item) => item.value === dateRange)?.label ?? "Last 3 Months";

  const filtered = useMemo(() => {
    const cutoff = getDateRangeCutoff(dateRange);
    const query = search.toLowerCase();

    return transactions.filter((txn) => {
      if (new Date(txn.date) < cutoff) return false;
      if (!matchesChip(txn, filter)) return false;
      if (statusFilter !== "all" && txn.status !== statusFilter) return false;
      if (categoryFilter !== "all" && txn.category !== categoryFilter) return false;
      if (minAmount && txn.amount < Number(minAmount)) return false;
      if (maxAmount && txn.amount > Number(maxAmount)) return false;

      if (
        query &&
        !txn.title.toLowerCase().includes(query) &&
        !txn.description.toLowerCase().includes(query) &&
        !txn.reference.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, filter, dateRange, search, statusFilter, categoryFilter, minAmount, maxAmount]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Transaction[] }>();

    for (const txn of filtered) {
      const group = map.get(txn.date);
      if (group) {
        group.items.push(txn);
      } else {
        map.set(txn.date, { label: getDateLabel(txn.date), items: [txn] });
      }
    }

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleExportCsv = () => {
    const rows = buildTransactionRows(filtered);
    const header = Object.keys(rows[0] ?? {
      Date: "",
      Time: "",
      Reference: "",
      Type: "",
      Category: "",
      Title: "",
      Description: "",
      Amount: "",
      Status: "",
    });
    const csv = [
      header.join(","),
      ...rows.map((row) => header.map((key) => csvEscape(row[key as keyof typeof row])).join(",")),
    ].join("\n");
    downloadTextFile("BCB-transactions.csv", csv, "text/csv;charset=utf-8");
    setShowExportMenu(false);
  };

  const handleExportPdf = () => {
    const lines = buildTransactionRows(filtered).flatMap((row) => [
      `${row.Date} ${row.Time} | ${row.Reference}`,
      `${row.Title} | ${row.Amount} | ${row.Status}`,
      "",
    ]);
    downloadSimplePdf("BCB-transactions.pdf", "BCB Transaction Statement", lines);
    setShowExportMenu(false);
  };

  const handleReportDispute = (txn: Transaction, reason: string, note: string) => {
    const ticket = reportDispute({
      reference: txn.reference,
      transactionTitle: txn.title,
      amount: txn.amount,
      reason,
      note,
    });
    return ticket.id;
  };

  return (
    <div
      className="flex min-h-full flex-col bg-background"
      onClick={() => showDateMenu && setShowDateMenu(false)}
      onKeyDown={() => showDateMenu && setShowDateMenu(false)}
      role="presentation"
    >
      <AppBar title="Transactions" showBack showNotifications={false} />

      <div className="sticky top-14 z-30 space-y-3 border-b border-border bg-background px-4 pb-3 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Export filtered transactions as CSV or PDF.
          </p>
          <div
            className="relative"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="presentation"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-xs"
              onClick={() => setShowExportMenu((previous) => !previous)}
              data-ocid="transactions.export_button"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
                >
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-foreground transition-smooth hover:bg-muted"
                    data-ocid="transactions.export_csv_button"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-foreground transition-smooth hover:bg-muted"
                    data-ocid="transactions.export_pdf_button"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, or reference..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 pl-9 pr-9 text-sm"
            data-ocid="transactions.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="scrollbar-hide flex flex-1 gap-2 overflow-x-auto pb-0.5">
            {FILTER_CHIPS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                data-ocid={`transactions.filter.${value}`}
                className={cn(
                  "flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-smooth",
                  filter === value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="relative flex-shrink-0"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setShowDateMenu((previous) => !previous)}
              data-ocid="transactions.date_filter"
              className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-primary/50 hover:text-foreground"
            >
              <RefreshCcw className="h-3 w-3" />
              {currentDateLabel}
              <ChevronDown
                className={cn("h-3 w-3 transition-smooth", showDateMenu && "rotate-180")}
              />
            </button>

            <AnimatePresence>
              {showDateMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
                  data-ocid="transactions.date_filter.popover"
                >
                  {DATE_RANGES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setDateRange(value);
                        setShowDateMenu(false);
                      }}
                      data-ocid={`transactions.date_range.${value}`}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-xs font-medium transition-smooth",
                        dateRange === value
                          ? "bg-primary/8 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-xs"
            data-ocid="transactions.status_filter"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-xs"
            data-ocid="transactions.category_filter"
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_CONFIG) as TransactionCategory[]).map((category) => (
              <option key={category} value={category}>{CATEGORY_CONFIG[category].label}</option>
            ))}
          </select>
          <Input
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            placeholder="Min amount"
            inputMode="decimal"
            className="h-10 text-xs"
            data-ocid="transactions.min_amount_filter"
          />
          <Input
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            placeholder="Max amount"
            inputMode="decimal"
            className="h-10 text-xs"
            data-ocid="transactions.max_amount_filter"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {grouped.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-20"
            data-ocid="transactions.empty_state"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
              <Search className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-foreground">No transactions found</p>
            <p className="max-w-[220px] text-center text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setDateRange("last_3_months");
              }}
              className="mt-1 text-xs font-semibold text-primary hover:underline"
              data-ocid="transactions.reset_filters_button"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([dateKey, group], groupIndex) => (
              <div key={dateKey}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIndex * 0.05 }}
                  className="mb-2 flex items-center gap-3"
                >
                  <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                    {group.items.length} txn{group.items.length !== 1 ? "s" : ""}
                  </span>
                </motion.div>

                <div className="space-y-2">
                  {group.items.map((txn, index) => {
                    const isCredit = txn.type === "credit";
                    const globalIndex = filtered.indexOf(txn);

                    return (
                      <motion.button
                        key={txn.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: groupIndex * 0.04 + index * 0.04,
                          duration: 0.3,
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3.5 text-left shadow-card transition-smooth hover:shadow-elevated"
                        data-ocid={`transactions.item.${globalIndex + 1}`}
                        onClick={() => setSelectedTxn(txn)}
                      >
                        <TxnIcon txn={txn} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {txn.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {txn.description}
                              </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <p
                                className={cn(
                                  "font-display text-sm font-bold",
                                  isCredit ? "text-success" : "text-destructive",
                                )}
                              >
                                {isCredit ? "+" : "-"}
                                {formatGHS(txn.amount)}
                              </p>
                              {isCredit ? (
                                <ArrowDownLeft className="ml-auto mt-0.5 h-3 w-3 text-success" />
                              ) : (
                                <ArrowUpRight className="ml-auto mt-0.5 h-3 w-3 text-destructive/70" />
                              )}
                            </div>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {txn.time}
                            </span>
                            <StatusBadge status={txn.status} />
                            <Badge
                              variant="outline"
                              className={cn(
                                "ml-auto h-auto border-0 px-1.5 py-0 text-[9px]",
                                CATEGORY_CONFIG[txn.category].bg,
                                CATEGORY_CONFIG[txn.category].text,
                              )}
                            >
                              {CATEGORY_CONFIG[txn.category].label}
                            </Badge>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-center pb-4 pt-2">
              <p className="text-xs text-muted-foreground">
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} shown
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTxn && (
          <TransactionDetailSheet
            txn={selectedTxn}
            onClose={() => setSelectedTxn(null)}
            onReport={handleReportDispute}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
