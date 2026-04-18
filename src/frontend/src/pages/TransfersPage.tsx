import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  Home,
  Loader2,
  Smartphone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type TabId = "bcb" | "interbank" | "momo";

interface TransferFormState {
  account: string;
  recipientName: string;
  amount: string;
  description: string;
  bank: string;
  provider: string;
  phone: string;
}

interface ConfirmPayload {
  type: TabId;
  from: string;
  to: string;
  recipientName: string;
  amount: number;
  description: string;
}

const BANKS = [
  "GCB Bank",
  "Ecobank Ghana",
  "Stanbic Bank",
  "Fidelity Bank",
  "Absa Bank Ghana",
  "CalBank",
];

const PROVIDERS = ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"];

function generateRef() {
  return `BCB${Date.now().toString().slice(-8)}`;
}

function buildPayload(tab: TabId, form: TransferFormState): ConfirmPayload {
  if (tab === "bcb") {
    return {
      type: "bcb",
      from: "My BCB Current Account",
      to: form.account,
      recipientName: form.recipientName || "BCB Customer",
      amount: Number(form.amount),
      description: form.description,
    };
  }

  if (tab === "interbank") {
    return {
      type: "interbank",
      from: "My BCB Current Account",
      to: `${form.bank} — ${form.account}`,
      recipientName: form.recipientName || "Bank Account Holder",
      amount: Number(form.amount),
      description: form.description,
    };
  }

  return {
    type: "momo",
    from: "My BCB Current Account",
    to: `${form.provider} — ${form.phone}`,
    recipientName: form.recipientName || "MoMo Subscriber",
    amount: Number(form.amount),
    description: form.description,
  };
}

function tabMeta(tab: TabId) {
  if (tab === "bcb") {
    return {
      label: "BCB Transfer",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      helper: "Instant · Free · 24/7",
      category: "transfer" as const,
      iconKey: "building-bank" as const,
    };
  }

  if (tab === "interbank") {
    return {
      label: "Interbank",
      icon: <Building2 className="w-4 h-4" />,
      helper: "GhIPSS · GHS 5.00 fee · 1-2 business days",
      category: "transfer" as const,
      iconKey: "landmark" as const,
    };
  }

  return {
    label: "Mobile Money",
    icon: <Smartphone className="w-4 h-4" />,
    helper: "MTN · Vodafone · AirtelTigo · GHS 1.00 fee",
    category: "momo" as const,
    iconKey: "smartphone" as const,
  };
}

function ConfirmSheet({
  payload,
  busy,
  onCancel,
  onConfirm,
}: {
  payload: ConfirmPayload;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const fee = payload.type === "bcb" ? "Free" : payload.type === "interbank" ? "GHS 5.00" : "GHS 1.00";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
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
        <h2 className="text-lg font-bold font-display">Confirm Transfer</h2>
        <p className="mb-5 text-sm text-muted-foreground">{tabMeta(payload.type).label}</p>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium text-right">{payload.from}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium text-right">{payload.to}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium text-right">{payload.recipientName}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-primary">{formatGHS(payload.amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Transfer Fee</span>
            <span className="font-medium">{fee}</span>
          </div>
          {payload.description && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Note</span>
              <span className="font-medium text-right">{payload.description}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={busy} onClick={onConfirm}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SuccessView({
  payload,
  reference,
  onDone,
}: {
  payload: ConfirmPayload;
  reference: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-card p-6 text-center shadow-card">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display">Transfer Successful</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatGHS(payload.amount)} sent to {payload.recipientName}
        </p>

        <div className="mt-6 w-full rounded-2xl border border-border p-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Reference</span>
            <button type="button" onClick={handleCopy} className="text-xs font-semibold text-primary">
              <Copy className="mr-1 inline h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 font-mono text-sm font-semibold">{reference}</p>
          <p className="mt-4 text-xs text-muted-foreground">Destination</p>
          <p className="text-sm font-medium">{payload.to}</p>
        </div>

        <Button className="mt-6 w-full" onClick={onDone}>
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function TransfersPage() {
  const navigate = useNavigate();
  const recordActivity = useBankStore((state) => state.recordActivity);

  const [tab, setTab] = useState<TabId>("bcb");
  const [busy, setBusy] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(null);
  const [successPayload, setSuccessPayload] = useState<ConfirmPayload | null>(null);
  const [reference, setReference] = useState("");
  const [form, setForm] = useState<TransferFormState>({
    account: "",
    recipientName: "",
    amount: "",
    description: "",
    bank: BANKS[0],
    provider: PROVIDERS[0],
    phone: "",
  });

  const meta = tabMeta(tab);

  const canContinue = useMemo(() => {
    const amountValid = Number(form.amount) > 0;
    if (tab === "bcb") return form.account.trim().length >= 10 && amountValid;
    if (tab === "interbank") return form.bank.trim().length > 0 && form.account.trim().length >= 6 && amountValid;
    return form.phone.trim().length >= 10 && amountValid;
  }, [form, tab]);

  const updateField = (field: keyof TransferFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    setConfirmPayload(buildPayload(tab, form));
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return;

    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const ref = generateRef();
    recordActivity({
      type: "debit",
      category: meta.category,
      title: `Transfer to ${confirmPayload.recipientName}`,
      description: confirmPayload.description || confirmPayload.to,
      amount: confirmPayload.amount,
      reference: ref,
      icon: meta.iconKey,
      notification: {
        type: "transaction",
        title: "Transfer Completed",
        message: `${formatGHS(confirmPayload.amount)} was sent to ${confirmPayload.recipientName}.`,
      },
    });

    setReference(ref);
    setSuccessPayload(confirmPayload);
    setConfirmPayload(null);
    setBusy(false);
    toast.success("Transfer completed", {
      description: `${formatGHS(confirmPayload.amount)} sent to ${confirmPayload.recipientName}`,
    });
  };

  if (successPayload) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <AppBar title="Transfer Receipt" showBack={false} showNotifications={false} />
        <SuccessView payload={successPayload} reference={reference} onDone={() => navigate({ to: "/dashboard" })} />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppBar title="Transfers" showBack />

      <div className="sticky top-14 z-20 border-b border-border bg-card px-2">
        <div className="flex">
          {(["bcb", "interbank", "momo"] as TabId[]).map((item) => {
            const itemMeta = tabMeta(item);
            return (
              <button
                key={item}
                type="button"
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-smooth",
                  tab === item ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setTab(item)}
              >
                {itemMeta.icon}
                <span>{itemMeta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {meta.icon}
            </div>
            <div>
              <h2 className="font-semibold font-display">{meta.label}</h2>
              <p className="text-xs text-muted-foreground">{meta.helper}</p>
            </div>
          </div>

          <div className="space-y-4">
            {tab === "interbank" && (
              <div className="space-y-1.5">
                <Label htmlFor="bank">Destination Bank</Label>
                <select
                  id="bank"
                  value={form.bank}
                  onChange={(event) => updateField("bank", event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tab === "momo" && (
              <div className="space-y-1.5">
                <Label htmlFor="provider">Network Provider</Label>
                <select
                  id="provider"
                  value={form.provider}
                  onChange={(event) => updateField("provider", event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="destination">
                {tab === "momo" ? "Mobile Number" : "Recipient Account Number"}
              </Label>
              <Input
                id="destination"
                value={tab === "momo" ? form.phone : form.account}
                onChange={(event) =>
                  updateField(tab === "momo" ? "phone" : "account", event.target.value)
                }
                placeholder={tab === "momo" ? "0241234567" : "Enter account number"}
                className="h-12"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                value={form.recipientName}
                onChange={(event) => updateField("recipientName", event.target.value)}
                placeholder="Enter recipient name"
                className="h-12"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  GHS
                </span>
                <Input
                  id="amount"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="0.00"
                  className="h-12 pl-14"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="e.g. Rent payment"
                className="h-12"
              />
            </div>

            <Button className="w-full" disabled={!canContinue} onClick={handleContinue}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmPayload && (
          <ConfirmSheet
            payload={confirmPayload}
            busy={busy}
            onCancel={() => !busy && setConfirmPayload(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
