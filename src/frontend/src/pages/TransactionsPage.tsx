import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatGHS } from "@/lib/formatters";
import type { Transaction, TransactionCategory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  QrCode,
  RefreshCcw,
  Search,
  Share2,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type FilterChip = "all" | "transfers" | "payments" | "deposits" | "withdrawals";
type DateRange = "this_week" | "this_month" | "last_3_months" | "custom";

/* ─── Constants ──────────────────────────────────────────────────────────── */

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

/* ─── Helpers ────────────────────────────────────────────────────────────── */

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
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    return d;
  }
  if (range === "this_month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (range === "last_3_months") {
    const d = new Date(now);
    d.setMonth(now.getMonth() - 3);
    return d;
  }
  return new Date(0);
}

function matchesChip(txn: Transaction, chip: FilterChip): boolean {
  if (chip === "all") return true;
  if (chip === "deposits") return txn.type === "credit";
  if (chip === "withdrawals")
    return (
      txn.type === "debit" &&
      txn.category !== "transfer" &&
      txn.category !== "payment"
    );
  if (chip === "transfers")
    return txn.category === "transfer" || txn.category === "momo";
  if (chip === "payments")
    return txn.category === "payment" || txn.category === "airtime";
  return true;
}

/* ─── Shared sub-components ──────────────────────────────────────────────── */

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
        "w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ring-2",
        ringColor,
      )}
    >
      {txn.icon}
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        cfg.className,
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

/* ─── Receipt Modal ──────────────────────────────────────────────────────── */

function ReceiptModal({
  txn,
  onClose,
}: { txn: Transaction; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-ocid="receipt.dialog"
    >
      <motion.div
        className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-elevated"
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BCB Header */}
        <div className="bcb-card-gradient px-6 py-5 flex flex-col items-center gap-2 text-primary-foreground">
          <img
            src="/assets/bcb-logo.png"
            alt="BCB"
            className="w-10 h-10 object-contain brightness-0 invert"
          />
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
            Bawjiase Community Bank
          </p>
          <p className="text-[11px] font-bold tracking-wider border border-primary-foreground/30 px-3 py-0.5 rounded-full">
            OFFICIAL RECEIPT
          </p>
        </div>

        {/* Jagged edge */}
        <div
          className="h-3 bg-background"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, transparent 8px, var(--card) 8px)",
            backgroundSize: "16px 100%",
          }}
        />

        {/* Body rows */}
        <div className="px-6 py-4 space-y-2.5 text-xs divide-y divide-border/40">
          {(
            [
              ["Reference", txn.reference],
              ["Transaction ID", txn.id],
              ["Type", CATEGORY_CONFIG[txn.category].label],
              [
                "Amount",
                (txn.type === "credit" ? "+" : "−") + formatGHS(txn.amount),
              ],
              ["Date", formatDate(txn.date)],
              ["Time", txn.time],
              [
                "Status",
                txn.status.charAt(0).toUpperCase() + txn.status.slice(1),
              ],
              ["Account", "Kofi Mensah — 1234567890"],
              ["Description", txn.description],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-1.5">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span
                className={cn(
                  "font-semibold text-foreground text-right",
                  label === "Amount" && txn.type === "credit"
                    ? "text-success"
                    : "",
                  label === "Amount" && txn.type === "debit"
                    ? "text-destructive"
                    : "",
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* QR placeholder */}
        <div className="flex flex-col items-center pb-4 gap-2">
          <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center border border-border">
            <QrCode className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Scan to verify authenticity
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-muted/40 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs h-10"
            data-ocid="receipt.close_button"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" /> Close
          </Button>
          <Button
            className="flex-1 gap-2 text-xs h-10"
            data-ocid="receipt.share_button"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Transaction Detail Sheet ───────────────────────────────────────────── */

function TransactionDetailSheet({
  txn,
  onClose,
}: { txn: Transaction; onClose: () => void }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const isCredit = txn.type === "credit";
  const catCfg = CATEGORY_CONFIG[txn.category];

  const detailRows: [string, string][] = [
    ["Transaction ID", txn.id],
    ["Reference No.", txn.reference],
    ["Type", isCredit ? "Credit" : "Debit"],
    ["Category", catCfg.label],
    ["Date", formatDate(txn.date)],
    ["Time", txn.time],
    ["Status", txn.status.charAt(0).toUpperCase() + txn.status.slice(1)],
    [`${isCredit ? "From" : "To"}`, txn.description],
    ["Account", "Kofi Mensah — 1234567890"],
    ["Narration", txn.description],
  ];

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
          className="w-full max-w-[430px] bg-card rounded-t-3xl overflow-hidden shadow-elevated max-h-[90dvh] flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Sheet header */}
          <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
            <h2 className="text-base font-semibold text-foreground font-display">
              Transaction Details
            </h2>
            <button
              type="button"
              onClick={onClose}
              data-ocid="transaction_detail.close_button"
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-smooth"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Amount hero */}
          <div className="flex flex-col items-center gap-2 py-5 bg-muted/40 mx-5 rounded-2xl mb-4 flex-shrink-0">
            <TxnIcon txn={txn} />
            <p
              className={cn(
                "text-2xl font-bold font-display mt-1",
                isCredit ? "text-success" : "text-destructive",
              )}
            >
              {isCredit ? "+" : "−"}
              {formatGHS(txn.amount)}
            </p>
            <p className="text-sm text-foreground font-semibold">{txn.title}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={txn.status} />
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  catCfg.bg,
                  catCfg.text,
                )}
              >
                {catCfg.label}
              </span>
            </div>
          </div>

          {/* Scrollable detail rows */}
          <div className="flex-1 overflow-y-auto px-5 divide-y divide-border/60 scrollbar-hide">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <span className="text-xs text-muted-foreground shrink-0">
                  {label}
                </span>
                <span className="text-xs font-medium text-foreground text-right break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Download Receipt CTA */}
          <div className="px-5 pt-4 pb-6 flex-shrink-0">
            <Button
              className="w-full gap-2 h-12"
              onClick={() => setShowReceipt(true)}
              data-ocid="transaction_detail.download_receipt_button"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showReceipt && (
          <ReceiptModal txn={txn} onClose={() => setShowReceipt(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function TransactionsPage() {
  const transactions = useBankStore((s) => s.transactions);
  const [filter, setFilter] = useState<FilterChip>("all");
  const [dateRange, setDateRange] = useState<DateRange>("last_3_months");
  const [search, setSearch] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const currentDateLabel =
    DATE_RANGES.find((d) => d.value === dateRange)?.label ?? "Last 3 Months";

  const filtered = useMemo(() => {
    const cutoff = getDateRangeCutoff(dateRange);
    const q = search.toLowerCase();
    return transactions.filter((txn) => {
      if (new Date(txn.date) < cutoff) return false;
      if (!matchesChip(txn, filter)) return false;
      if (
        q &&
        !txn.title.toLowerCase().includes(q) &&
        !txn.description.toLowerCase().includes(q) &&
        !txn.reference.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [transactions, filter, dateRange, search]);

  // Group by date, sorted descending
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Transaction[] }>();
    for (const txn of filtered) {
      const existing = map.get(txn.date);
      if (existing) {
        existing.items.push(txn);
      } else {
        map.set(txn.date, { label: getDateLabel(txn.date), items: [txn] });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div
      className="flex flex-col min-h-full bg-background"
      onClick={() => showDateMenu && setShowDateMenu(false)}
      onKeyDown={() => showDateMenu && setShowDateMenu(false)}
      role="presentation"
    >
      <AppBar title="Transactions" showBack showNotifications={false} />

      {/* Sticky search + filters */}
      <div className="sticky top-14 z-30 bg-background border-b border-border px-4 pt-3 pb-3 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm"
            data-ocid="transactions.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter chips + date dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
            {FILTER_CHIPS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                data-ocid={`transactions.filter.${value}`}
                className={cn(
                  "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-smooth border",
                  filter === value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date dropdown */}
          <div
            className="relative flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setShowDateMenu((p) => !p)}
              data-ocid="transactions.date_filter"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground transition-smooth whitespace-nowrap"
            >
              <RefreshCcw className="w-3 h-3" />
              {currentDateLabel}
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-smooth",
                  showDateMenu && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {showDateMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden"
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
                        "w-full text-left px-4 py-2.5 text-xs font-medium transition-smooth",
                        dateRange === value
                          ? "text-primary bg-primary/8"
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
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {grouped.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="transactions.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
              🔍
            </div>
            <p className="text-sm font-semibold text-foreground">
              No transactions found
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Try adjusting your search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setDateRange("last_3_months");
              }}
              className="text-xs text-primary font-semibold mt-1 hover:underline"
              data-ocid="transactions.reset_filters_button"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([dateKey, group], groupIdx) => (
              <div key={dateKey}>
                {/* Date header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIdx * 0.05 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {group.items.length} txn
                    {group.items.length !== 1 ? "s" : ""}
                  </span>
                </motion.div>

                {/* Transaction items */}
                <div className="space-y-2">
                  {group.items.map((txn, idx) => {
                    const isCredit = txn.type === "credit";
                    const globalIdx = filtered.indexOf(txn);
                    return (
                      <motion.button
                        key={txn.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: groupIdx * 0.04 + idx * 0.04,
                          duration: 0.3,
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 shadow-card hover:shadow-elevated transition-smooth text-left"
                        data-ocid={`transactions.item.${globalIdx + 1}`}
                        onClick={() => setSelectedTxn(txn)}
                      >
                        <TxnIcon txn={txn} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {txn.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {txn.description}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p
                                className={cn(
                                  "text-sm font-bold font-display",
                                  isCredit
                                    ? "text-success"
                                    : "text-destructive",
                                )}
                              >
                                {isCredit ? "+" : "−"}
                                {formatGHS(txn.amount)}
                              </p>
                              {isCredit ? (
                                <ArrowDownLeft className="w-3 h-3 text-success ml-auto mt-0.5" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-destructive/70 ml-auto mt-0.5" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {txn.time}
                            </span>
                            <StatusBadge status={txn.status} />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] py-0 px-1.5 h-auto border-0 ml-auto",
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

            {/* Count footer */}
            <div className="flex justify-center pt-2 pb-4">
              <p className="text-xs text-muted-foreground">
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{" "}
                shown
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {selectedTxn && (
          <TransactionDetailSheet
            txn={selectedTxn}
            onClose={() => setSelectedTxn(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
