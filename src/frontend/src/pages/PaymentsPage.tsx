import { AppBar } from "@/components/layout/AppBar";
import { PinConfirmDialog } from "@/components/PinConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  CheckCircle2,
  Copy,
  Droplets,
  Loader2,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PaymentCategory = "ecg" | "water" | "dstv" | "airtime";

interface PaymentState {
  category: PaymentCategory;
  reference: string;
  amount: string;
  network: "MTN" | "Vodafone" | "AirtelTigo";
}

interface CompletedPayment {
  state: PaymentState;
  reference: string;
  date: string;
  time: string;
}

const CATEGORY_META = {
  ecg: {
    label: "ECG Electricity",
    description: "Prepaid and postpaid meter top-up",
    icon: <Zap className="h-5 w-5" />,
    iconKey: "bolt" as const,
    category: "payment" as const,
    presets: [20, 50, 100, 200],
    referenceLabel: "Meter Number",
    minReferenceLength: 6,
  },
  water: {
    label: "Ghana Water",
    description: "Water bill payments",
    icon: <Droplets className="h-5 w-5" />,
    iconKey: "droplets" as const,
    category: "payment" as const,
    presets: [20, 40, 80, 120],
    referenceLabel: "Account Number",
    minReferenceLength: 6,
  },
  dstv: {
    label: "DStv",
    description: "Subscription renewal",
    icon: <Tv className="h-5 w-5" />,
    iconKey: "tv" as const,
    category: "payment" as const,
    presets: [85, 120, 180, 220],
    referenceLabel: "Smart Card Number",
    minReferenceLength: 8,
  },
  airtime: {
    label: "Airtime & Data",
    description: "Top up your mobile number",
    icon: <Smartphone className="h-5 w-5" />,
    iconKey: "phone" as const,
    category: "airtime" as const,
    presets: [1, 2, 5, 10, 20, 50],
    referenceLabel: "Phone Number",
    minReferenceLength: 10,
  },
};

function generateRef() {
  return `BCB${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function isValidGhanaPhone(value: string) {
  const digits = digitsOnly(value);
  return /^(0\d{9}|233\d{9})$/.test(digits);
}

function validatePayment(payment: PaymentState, currentBalance: number) {
  const meta = CATEGORY_META[payment.category];
  const amount = Number(payment.amount);
  const errors: Partial<Record<"reference" | "amount" | "balance", string>> = {};

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than GHS 0.00.";
  } else if (amount > currentBalance) {
    errors.balance = `Insufficient balance. Available: ${formatGHS(currentBalance)}.`;
  }

  if (payment.category === "airtime") {
    if (!isValidGhanaPhone(payment.reference)) {
      errors.reference = "Enter a valid Ghana mobile number, e.g. 0241234567.";
    }
  } else if (digitsOnly(payment.reference).length < meta.minReferenceLength) {
    errors.reference = `${meta.referenceLabel} must be at least ${meta.minReferenceLength} digits.`;
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function PaymentReceipt({
  completed,
  onDone,
}: {
  completed: CompletedPayment;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const meta = CATEGORY_META[completed.state.category];
  const amount = Number(completed.state.amount);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(completed.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const rows = [
    ["Reference", completed.reference],
    ["Date", `${formatDate(completed.date)} at ${completed.time}`],
    ["Service", meta.label],
    [meta.referenceLabel, completed.state.reference],
    ["Amount", formatGHS(amount)],
    ["Status", "Completed"],
  ];

  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-card p-6 text-center shadow-card">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold">Payment Successful</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {meta.label} paid successfully.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-border p-4 text-left">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-b-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-right font-semibold">{value}</span>
            </div>
          ))}
          <button type="button" onClick={handleCopy} className="mt-3 text-xs font-semibold text-primary">
            <Copy className="mr-1 inline h-3.5 w-3.5" />
            {copied ? "Reference copied" : "Copy reference"}
          </button>
        </div>

        <Button className="mt-6 w-full" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const recordActivity = useBankStore((state) => state.recordActivity);
  const currentBalance = useBankStore((state) => state.currentBalance);

  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [completed, setCompleted] = useState<CompletedPayment | null>(null);
  const [touched, setTouched] = useState(false);
  const [payment, setPayment] = useState<PaymentState>({
    category: "ecg",
    reference: "",
    amount: "",
    network: "MTN",
  });

  const meta = CATEGORY_META[payment.category];
  const errors = useMemo(
    () => validatePayment(payment, currentBalance),
    [currentBalance, payment],
  );
  const canContinue = Object.keys(errors).length === 0;

  const updateField = (field: keyof PaymentState, value: string) => {
    setPayment((current) => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    setTouched(true);
    if (!canContinue) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setPinOpen(true);
  };

  const handlePinConfirmed = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const ref = generateRef();
    const date = today();
    const time = nowTime();
    recordActivity({
      type: "debit",
      category: meta.category,
      title: `${meta.label} Payment`,
      description: payment.reference,
      amount: Number(payment.amount),
      reference: ref,
      icon: meta.iconKey,
      notification: {
        type: "transaction",
        title: "Payment Completed",
        message: `${formatGHS(Number(payment.amount))} was paid for ${meta.label}.`,
      },
    });

    setBusy(false);
    setPinOpen(false);
    setConfirmOpen(false);
    setCompleted({ state: payment, reference: ref, date, time });
    toast.success("Payment completed", {
      description: `${formatGHS(Number(payment.amount))} paid for ${meta.label}`,
    });
  };

  if (completed) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <AppBar title="Payment Receipt" showBack={false} showNotifications={false} />
        <PaymentReceipt
          completed={completed}
          onDone={() => {
            setCompleted(null);
            setTouched(false);
            setPayment({
              category: "ecg",
              reference: "",
              amount: "",
              network: "MTN",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppBar title="Payments" showBack />

      <div className="flex-1 px-4 py-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CATEGORY_META) as PaymentCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  updateField("category", category);
                  setTouched(false);
                }}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-smooth",
                  payment.category === category
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background",
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {CATEGORY_META[category].icon}
                </div>
                <p className="text-sm font-semibold">{CATEGORY_META[category].label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CATEGORY_META[category].description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {payment.category === "airtime" && (
              <div className="space-y-1.5">
                <Label htmlFor="network">Network</Label>
                <select
                  id="network"
                  value={payment.network}
                  onChange={(event) => updateField("network", event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="MTN">MTN</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reference">{meta.referenceLabel}</Label>
              <Input
                id="reference"
                value={payment.reference}
                onChange={(event) => updateField("reference", event.target.value)}
                placeholder={`Enter ${meta.referenceLabel.toLowerCase()}`}
                className="h-12"
              />
              <FieldError message={touched ? errors.reference : undefined} />
            </div>

            <div className="space-y-1.5">
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {meta.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-semibold transition-smooth",
                      payment.amount === String(preset)
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border bg-background",
                    )}
                    onClick={() => updateField("amount", String(preset))}
                  >
                    {formatGHS(preset)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  GHS
                </span>
                <Input
                  id="amount"
                  value={payment.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="0.00"
                  className="h-12 pl-14"
                  inputMode="decimal"
                />
              </div>
              <FieldError message={touched ? errors.amount ?? errors.balance : undefined} />
            </div>

            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{meta.label}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-primary">
                  {formatGHS(Number(payment.amount || 0))}
                </span>
              </div>
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue to Confirm
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setConfirmOpen(false)}
          >
            <motion.div
              className="w-full max-w-[430px] rounded-3xl bg-card p-6 shadow-elevated"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
              <h2 className="font-display text-lg font-bold">Confirm Payment</h2>
              <p className="mb-5 text-sm text-muted-foreground">{meta.label}</p>

              <div className="space-y-3 rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{meta.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{meta.referenceLabel}</span>
                  <span className="text-right font-medium">{payment.reference}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">
                    {formatGHS(Number(payment.amount))}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" disabled={busy} onClick={handleConfirm}>
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatGHS(Number(payment.amount))}`
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PinConfirmDialog
        open={pinOpen}
        title="Confirm Payment PIN"
        description="Enter your 4-digit PIN to authorize this payment."
        confirmLabel="Authorize Payment"
        busy={busy}
        onOpenChange={setPinOpen}
        onConfirm={handlePinConfirmed}
      />
    </div>
  );
}
