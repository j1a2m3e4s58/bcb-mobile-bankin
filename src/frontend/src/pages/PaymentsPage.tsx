import { AppBar } from "@/components/layout/AppBar";
import { PinConfirmDialog } from "@/components/PinConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  CheckCircle2,
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
  packageName: string;
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
  },
  water: {
    label: "Ghana Water",
    description: "Water bill payments",
    icon: <Droplets className="h-5 w-5" />,
    iconKey: "droplets" as const,
    category: "payment" as const,
    presets: [20, 40, 80, 120],
    referenceLabel: "Account Number",
  },
  dstv: {
    label: "DStv",
    description: "Subscription renewal",
    icon: <Tv className="h-5 w-5" />,
    iconKey: "tv" as const,
    category: "payment" as const,
    presets: [85, 120, 180, 220],
    referenceLabel: "Smart Card Number",
  },
  airtime: {
    label: "Airtime & Data",
    description: "Top up your mobile number",
    icon: <Smartphone className="h-5 w-5" />,
    iconKey: "phone" as const,
    category: "airtime" as const,
    presets: [1, 2, 5, 10, 20, 50],
    referenceLabel: "Phone Number",
  },
};

function generateRef() {
  return `BCB${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;
}

function PaymentSuccess({
  state,
  reference,
  onDone,
}: {
  state: PaymentState;
  reference: string;
  onDone: () => void;
}) {
  const meta = CATEGORY_META[state.category];
  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-card p-6 text-center shadow-card">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display">Payment Successful</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {meta.label} paid successfully.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-border p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{meta.label}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-primary">{formatGHS(Number(state.amount))}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs font-semibold">{reference}</span>
          </div>
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

  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [successRef, setSuccessRef] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [payment, setPayment] = useState<PaymentState>({
    category: "ecg",
    reference: "",
    amount: "",
    network: "MTN",
    packageName: "",
  });

  const meta = CATEGORY_META[payment.category];
  const canContinue = useMemo(
    () => payment.reference.trim().length >= 4 && Number(payment.amount) > 0,
    [payment.amount, payment.reference],
  );

  const updateField = (field: keyof PaymentState, value: string) => {
    setPayment((current) => ({ ...current, [field]: value }));
  };

  const handleConfirm = () => {
    setPinOpen(true);
  };

  const handlePinConfirmed = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const ref = generateRef();
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
    setSuccessRef(ref);
    setShowSuccess(true);
    toast.success("Payment completed", {
      description: `${formatGHS(Number(payment.amount))} paid for ${meta.label}`,
    });
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <AppBar title="Payment Successful" showBack={false} showNotifications={false} />
        <PaymentSuccess
          state={payment}
          reference={successRef}
          onDone={() => {
            setShowSuccess(false);
            setPayment({
              category: "ecg",
              reference: "",
              amount: "",
              network: "MTN",
              packageName: "",
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
                onClick={() => updateField("category", category)}
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

            <Button className="w-full" disabled={!canContinue} onClick={() => setConfirmOpen(true)}>
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
              <h2 className="text-lg font-bold font-display">Confirm Payment</h2>
              <p className="mb-5 text-sm text-muted-foreground">{meta.label}</p>

              <div className="space-y-3 rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{meta.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{meta.referenceLabel}</span>
                  <span className="font-medium text-right">{payment.reference}</span>
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
